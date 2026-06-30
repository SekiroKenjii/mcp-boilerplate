#!/usr/bin/env node
import { env } from './config/env.js';
import { logger } from './core/logger.js';
import { createServer } from './server.js';
import { startHttp } from './transports/http.js';
import { startStdio } from './transports/stdio.js';

type TransportKind = 'stdio' | 'http';

/** CLI `--transport=<kind>` flag wins over the `MCP_TRANSPORT` env var. */
function resolveTransport(): TransportKind {
  const flag = process.argv.find((arg) => arg.startsWith('--transport='));
  const value = flag ? flag.slice('--transport='.length) : env.MCP_TRANSPORT;
  if (value !== 'stdio' && value !== 'http') {
    logger.error({ value }, 'Unknown transport; expected "stdio" or "http"');
    process.exit(1);
  }
  return value;
}

async function main(): Promise<void> {
  const transport = resolveTransport();
  const shutdown = transport === 'http' ? await startHttp() : await startStdio(createServer());

  let shuttingDown = false;
  const onSignal = (signal: NodeJS.Signals): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Shutting down');
    shutdown()
      .then(() => process.exit(0))
      .catch((error: unknown) => {
        logger.error({ err: error }, 'Error during shutdown');
        process.exit(1);
      });
  };

  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
}

try {
  await main();
} catch (error) {
  logger.error({ err: error }, 'Fatal error during startup');
  process.exit(1);
}
