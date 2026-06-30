import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { toToolError } from '../core/errors.js';

const inputSchema = {
  message: z.string().min(1).describe('The text to echo back'),
  uppercase: z.boolean().default(false).describe('Return the message in upper case'),
};

const outputSchema = {
  echoed: z.string().describe('The (optionally transformed) message'),
  length: z.number().int().nonnegative().describe('Character count of the echoed message'),
};

/**
 * Example tool. Copy this file as a template for new tools:
 *  1. define `inputSchema` / `outputSchema` as Zod raw shapes,
 *  2. implement the handler returning `content` (+ `structuredContent`),
 *  3. register it in `src/tools/index.ts`.
 */
export function registerEchoTool(server: McpServer): void {
  server.registerTool(
    'echo',
    {
      title: 'Echo',
      description: 'Echo a message back to the caller, optionally upper-cased.',
      inputSchema,
      outputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ message, uppercase }) => {
      try {
        const echoed = uppercase ? message.toUpperCase() : message;
        const structuredContent = { echoed, length: echoed.length };
        return {
          content: [{ type: 'text', text: echoed }],
          structuredContent,
        };
      } catch (error) {
        return toToolError(error);
      }
    },
  );
}
