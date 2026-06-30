import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Example prompt. Prompts are reusable, parameterized message templates the
 * client can render. Register additional prompts in `src/prompts/index.ts`.
 */
export function registerSummarizePrompt(server: McpServer): void {
  server.registerPrompt(
    'summarize',
    {
      title: 'Summarize Text',
      description: 'Build a prompt asking the model to summarize the provided text.',
      argsSchema: {
        text: z.string().min(1).describe('The text to summarize'),
        style: z
          .enum(['concise', 'detailed', 'bullets'])
          .default('concise')
          .describe('Desired summary style'),
      },
    },
    ({ text, style }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Summarize the following text in a ${style} style:\n\n${text}`,
          },
        },
      ],
    }),
  );
}
