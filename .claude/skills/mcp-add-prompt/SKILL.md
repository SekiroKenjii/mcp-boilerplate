---
name: mcp-add-prompt
description: Add a new MCP prompt template to this server. Use when the user asks to add a reusable prompt, message template, or parameterized instruction exposed over MCP in this codebase.
---

# Add an MCP prompt

Reference implementation: [src/prompts/summarize.prompt.ts](../../../src/prompts/summarize.prompt.ts).

## Steps

1. Create `src/prompts/<name>.prompt.ts` exporting `register<Name>Prompt(server: McpServer): void`.
   - Define `argsSchema` as a **Zod raw shape** with `.describe()` on each argument.
   - Call `server.registerPrompt(name, { title, description, argsSchema }, handler)`.
   - Return `{ messages: [{ role: 'user', content: { type: 'text', text } }] }`.
2. Register it in [src/prompts/index.ts](../../../src/prompts/index.ts).
3. Add a test via `client.getPrompt({ name, arguments })` using `connectClient()`.
4. Verify: `pnpm typecheck && pnpm lint && pnpm test`.

## Conventions

- Prompts are templates, not executors — build and return messages; do no side effects.
- Keep arguments minimal and well described; the descriptions surface in client UIs.
