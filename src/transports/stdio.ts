import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { logger } from '../core/logger.js';

/**
 * Connect a server over stdio (local clients spawn the process and talk JSON-RPC
 * over stdin/stdout). Returns a shutdown function that closes the transport.
 */
export async function startStdio(server: McpServer): Promise<() => Promise<void>> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('MCP server connected over stdio');

  return async () => {
    await transport.close();
  };
}
