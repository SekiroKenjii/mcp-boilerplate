---
description: Scaffold a new MCP tool following this repo's conventions
argument-hint: <tool-name> [what it should do]
---

Create a new MCP tool for this server based on the request: **$ARGUMENTS**

Follow the `mcp-add-tool` skill and the pattern in `src/tools/echo.tool.ts`:

1. Create `src/tools/<name>.tool.ts` with Zod `inputSchema` / `outputSchema` raw shapes and a
   `register<Name>Tool(server)` export. Use honest `annotations`. Return `content` (+
   `structuredContent` when an output schema is defined). Use `toToolError` for failures.
2. Register it in `src/tools/index.ts`.
3. Add `tests/tools/<name>.test.ts` using `connectClient()`.
4. Run `pnpm typecheck && pnpm lint && pnpm test` and fix anything that fails.

If the tool's input fields, output shape, or behavior are not clear from the request, ask me
before writing code (per the karpathy-guidelines skill).
