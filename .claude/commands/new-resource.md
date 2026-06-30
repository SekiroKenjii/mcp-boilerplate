---
description: Scaffold a new MCP resource following this repo's conventions
argument-hint: <resource-name> [what data it exposes]
---

Create a new MCP resource for this server based on the request: **$ARGUMENTS**

Follow the `mcp-add-resource` skill and the pattern in `src/resources/system-info.resource.ts`:

1. Create `src/resources/<name>.resource.ts` exporting `register<Name>Resource(server)`. Choose a
   static URI or a `ResourceTemplate` with a `complete` callback as appropriate. Return `contents`.
2. Register it in `src/resources/index.ts`.
3. Add a test that reads it via `client.readResource({ uri })`.
4. Run `pnpm typecheck && pnpm lint && pnpm test` and fix anything that fails.

Ask me about the URI scheme, mime type, and data source if they are not clear from the request.
