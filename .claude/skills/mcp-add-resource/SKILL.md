---
name: mcp-add-resource
description: Add a new MCP resource (static URI or templated) to this server. Use when the user asks to expose data, files, config, or readable content over MCP in this codebase.
---

# Add an MCP resource

Reference implementation: [src/resources/system-info.resource.ts](../../../src/resources/system-info.resource.ts).

## Steps

1. Create `src/resources/<name>.resource.ts` exporting `register<Name>Resource(server: McpServer): void`.
   - **Static** resource: `server.registerResource(name, 'scheme://path', { title, description, mimeType }, handler)`.
   - **Templated** resource: pass `new ResourceTemplate('scheme://{var}', { list, complete })`.
     The handler receives `(uri, variables)`; remember `variables.<var>` can be `string | string[]`.
   - Return `{ contents: [{ uri, mimeType, text }] }` (use `blob` instead of `text` for binary).
2. Register it in [src/resources/index.ts](../../../src/resources/index.ts).
3. Add a test that reads it via `client.readResource({ uri })` using `connectClient()`.
4. Verify: `pnpm typecheck && pnpm lint && pnpm test`.

## Conventions

- Pick a clear URI scheme (`info://`, `config://`, `file://`, …) and a correct `mimeType`.
- Provide a `complete` callback for templated variables when the set of values is known —
  it powers client autocompletion.
- Logs go to **stderr only** via `logger`; never `console.log`.
