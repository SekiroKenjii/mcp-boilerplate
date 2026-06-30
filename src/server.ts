import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { packageInfo } from './core/pkg.js';
import { registerPrompts } from './prompts/index.js';
import { registerResources } from './resources/index.js';
import { registerTools } from './tools/index.js';

/**
 * Build a fully-configured MCP server with all tools, resources and prompts
 * registered. A fresh instance is created per stdio process and per HTTP
 * session, so this must be cheap and side-effect free.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: packageInfo.name,
    version: packageInfo.version,
  });

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}
