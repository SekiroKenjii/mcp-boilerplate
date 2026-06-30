import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerSystemInfoResource } from './system-info.resource.js';

/** Register every resource with the server. Add new resources here. */
export function registerResources(server: McpServer): void {
  registerSystemInfoResource(server);
}
