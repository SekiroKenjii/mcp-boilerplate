import { ResourceTemplate, type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { packageInfo } from '../core/pkg.js';

/**
 * Example resources: one static resource (fixed URI) and one templated resource
 * (URI variable + completion). Register additional resources in
 * `src/resources/index.ts`.
 */
export function registerSystemInfoResource(server: McpServer): void {
  server.registerResource(
    'server-info',
    'info://server',
    {
      title: 'Server Info',
      description: 'Name, version and runtime information for this MCP server.',
      mimeType: 'application/json',
    },
    () => ({
      contents: [
        {
          uri: 'info://server',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              name: packageInfo.name,
              version: packageInfo.version,
              node: process.version,
              uptimeSeconds: Math.round(process.uptime()),
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    'greeting',
    new ResourceTemplate('greet://{name}', {
      list: undefined,
      complete: {
        name: (value) =>
          ['world', 'team', 'mcp'].filter((candidate) => candidate.startsWith(value)),
      },
    }),
    {
      title: 'Greeting',
      description: 'A personalized greeting for the provided name.',
    },
    (uri, variables) => {
      const raw = variables.name;
      const name = Array.isArray(raw) ? raw[0] : raw;
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Hello, ${name ?? 'world'}!`,
          },
        ],
      };
    },
  );
}
