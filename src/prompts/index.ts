import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerSummarizePrompt } from './summarize.prompt.js';

/** Register every prompt with the server. Add new prompts here. */
export function registerPrompts(server: McpServer): void {
  registerSummarizePrompt(server);
}
