---
name: mcp-add-tool
description: Add a new MCP tool to this server. Use when the user asks to create, add, or scaffold a tool, command, or action exposed over MCP in this codebase.
---

# Add an MCP tool

Reference implementation: [src/tools/echo.tool.ts](../../../src/tools/echo.tool.ts).

## Steps

1. Create `src/tools/<name>.tool.ts`:
   - Define `inputSchema` and (optionally) `outputSchema` as **Zod raw shapes** — plain
     objects of `z.*` fields, **not** `z.object(...)`. Add `.describe()` to every field.
   - Export `register<Name>Tool(server: McpServer): void` that calls `server.registerTool(...)`.
   - Provide `title`, `description`, and honest `annotations`
     (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`).
   - Return `{ content: [...] }`. When `outputSchema` is set, also return `structuredContent`
     matching that schema.
   - Wrap fallible logic in `try/catch` and return `toToolError(error)` from
     [src/core/errors.ts](../../../src/core/errors.ts) — never throw raw from a handler.
2. Register it in [src/tools/index.ts](../../../src/tools/index.ts) (import + call inside `registerTools`).
3. Add `tests/tools/<name>.test.ts` using `connectClient()` from
   [tests/helpers/connect.ts](../../../tests/helpers/connect.ts).
4. Verify: `pnpm typecheck && pnpm lint && pnpm test`.

## Conventions

- **Logs go to stderr only** — use `logger` from [src/core/logger.ts](../../../src/core/logger.ts).
  Never `console.log`; it corrupts the stdio JSON-RPC stream.
- Validate every input through the Zod schema; do not trust caller arguments.
- Keep tools focused and side-effect-honest. Mark mutating tools with `destructiveHint: true`
  and `readOnlyHint: false`.
