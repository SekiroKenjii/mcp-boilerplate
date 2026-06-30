---
description: Scaffold a new MCP prompt following this repo's conventions
argument-hint: <prompt-name> [what the prompt should produce]
---

Create a new MCP prompt for this server based on the request: **$ARGUMENTS**

Follow the `mcp-add-prompt` skill and the pattern in `src/prompts/summarize.prompt.ts`:

1. Create `src/prompts/<name>.prompt.ts` exporting `register<Name>Prompt(server)` with an
   `argsSchema` (Zod raw shape) and a handler returning `messages`.
2. Register it in `src/prompts/index.ts`.
3. Add a test via `client.getPrompt({ name, arguments })`.
4. Run `pnpm typecheck && pnpm lint && pnpm test` and fix anything that fails.

Ask me about the arguments and desired output if they are not clear from the request.
