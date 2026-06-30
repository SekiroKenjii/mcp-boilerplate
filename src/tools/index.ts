import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerEchoTool } from './echo.tool.js';

/** Register every tool with the server. Add new tools here. */
export function registerTools(server: McpServer): void {
  registerEchoTool(server);
}
