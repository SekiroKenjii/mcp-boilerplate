import { randomUUID } from 'node:crypto';
import { type Server as HttpServer } from 'node:http';

import { hostHeaderValidation } from '@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import cors from 'cors';
import express, { type Request, type RequestHandler, type Response } from 'express';

import { createAuthMiddleware } from '../core/auth.js';
import { env, parseList } from '../config/env.js';
import { logger } from '../core/logger.js';
import { createServer } from '../server.js';

/** Adapt an async handler to Express, forwarding rejections to a 500 response. */
function wrap(handler: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req, res) => {
    handler(req, res).catch((error: unknown) => {
      logger.error({ err: error }, 'Unhandled error in HTTP handler');
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    });
  };
}

/**
 * Serve MCP over Streamable HTTP with per-session transports. Each new session
 * gets its own server instance; the `mcp-session-id` header routes subsequent
 * requests. Returns a shutdown function that closes sessions and the listener.
 */
export async function startHttp(): Promise<() => Promise<void>> {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  const corsOrigins = parseList(env.CORS_ORIGINS);
  if (corsOrigins.length > 0) {
    app.use(
      cors({
        origin: corsOrigins,
        exposedHeaders: ['Mcp-Session-Id'],
        allowedHeaders: ['Content-Type', 'Mcp-Session-Id', 'Last-Event-ID', 'Authorization'],
      }),
    );
  }

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // DNS-rebinding protection: validate the Host header (port-agnostic) on /mcp.
  const allowedHosts = parseList(env.ALLOWED_HOSTS);
  if (allowedHosts.length > 0) {
    app.use('/mcp', hostHeaderValidation(allowedHosts));
  } else {
    logger.warn('ALLOWED_HOSTS is empty: Host-header (DNS-rebinding) protection is disabled');
  }

  // Optional bearer auth. When enabled, /mcp requires a valid Authorization token.
  const authMiddleware = createAuthMiddleware();
  if (authMiddleware) {
    app.use('/mcp', authMiddleware);
    logger.info('Bearer auth enabled on /mcp');
  } else {
    logger.info('Bearer auth disabled: /mcp is open (rely on ALLOWED_HOSTS / a trusted proxy)');
  }

  const transports = new Map<string, StreamableHTTPServerTransport>();

  app.post(
    '/mcp',
    wrap(async (req, res) => {
      const sessionId = req.header('mcp-session-id');
      const existing = sessionId ? transports.get(sessionId) : undefined;
      const body: unknown = req.body;

      if (existing) {
        await existing.handleRequest(req, res, body);
        return;
      }

      if (sessionId || !isInitializeRequest(body)) {
        res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Bad Request: no valid session for request' },
          id: null,
        });
        return;
      }

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports.set(id, transport);
          logger.info({ sessionId: id }, 'MCP session initialized');
        },
        onsessionclosed: (id) => {
          transports.delete(id);
          logger.info({ sessionId: id }, 'MCP session closed');
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
      };

      const server = createServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    }),
  );

  // GET opens the server-to-client SSE stream; DELETE terminates a session.
  const handleSessionRequest = wrap(async (req, res) => {
    const sessionId = req.header('mcp-session-id');
    const transport = sessionId ? transports.get(sessionId) : undefined;
    if (!transport) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    await transport.handleRequest(req, res);
  });

  app.get('/mcp', handleSessionRequest);
  app.delete('/mcp', handleSessionRequest);

  const httpServer = await new Promise<HttpServer>((resolve) => {
    const listener = app.listen(env.PORT, env.HOST, () => resolve(listener));
  });
  logger.info({ host: env.HOST, port: env.PORT }, 'MCP server listening over Streamable HTTP');

  return async () => {
    for (const transport of transports.values()) {
      await transport.close();
    }
    transports.clear();
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  };
}
