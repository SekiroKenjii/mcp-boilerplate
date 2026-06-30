# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this is

A production-grade boilerplate for building **MCP (Model Context Protocol) servers** in
TypeScript. It exposes tools, resources, and prompts over two transports: **stdio** (local
clients) and **Streamable HTTP** (remote/hosted). SDK: `@modelcontextprotocol/sdk` (1.x).

## Golden rules

1. **Logs go to stderr only.** stdout is the stdio JSON-RPC channel. Use `logger` from
   [src/core/logger.ts](src/core/logger.ts); never `console.log`.
2. **Surface assumptions, keep changes surgical, prefer the simplest solution.** See the
   `karpathy-guidelines` skill — it applies to all work here.
3. **Validate all external input** through Zod schemas. Tool handlers must not throw raw;
   return `toToolError(error)` from [src/core/errors.ts](src/core/errors.ts).
4. **Every change must pass** `pnpm typecheck && pnpm lint && pnpm test` before it's done.
5. Use the **context7 MCP** to confirm current API syntax for the SDK, Zod, Express, etc.
   before relying on memory — these libraries move quickly.

## Layout

```
src/
  index.ts          Entrypoint: resolves transport (--transport / MCP_TRANSPORT), graceful shutdown
  server.ts         createServer(): builds McpServer and registers features
  config/env.ts     Zod-validated environment configuration
  core/             logger (stderr), errors (AppError + toToolError), pkg, auth (optional bearer)
  transports/       stdio.ts and http.ts (Express + Streamable HTTP, sessions, /healthz)
  tools/            One file per tool + index.ts aggregator (example: echo.tool.ts)
  resources/        One file per resource + index.ts aggregator
  prompts/          One file per prompt + index.ts aggregator
tests/              Vitest; connect an in-memory Client to the real server via helpers/connect.ts
```

Adding a feature = new file in the relevant folder + one import line in that folder's `index.ts`.

## How to extend

- Add a tool → use the `mcp-add-tool` skill (or `/new-tool`).
- Add a resource → `mcp-add-resource` skill (or `/new-resource`).
- Add a prompt → `mcp-add-prompt` skill (or `/new-prompt`).

## Commands

| Task                    | Command                                                |
| ----------------------- | ------------------------------------------------------ |
| Dev (stdio, watch)      | `pnpm dev`                                             |
| Dev (HTTP, watch)       | `pnpm dev:http`                                        |
| Type-check              | `pnpm typecheck`                                       |
| Lint / fix              | `pnpm lint` / `pnpm lint:fix`                          |
| Test / watch / coverage | `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` |
| Build                   | `pnpm build`                                           |
| Run built server        | `pnpm start` / `pnpm start:http`                       |
| Inspect locally         | `pnpm inspector` (MCP Inspector over stdio)            |

## Conventions

- Native ESM, `NodeNext` modules — **use `.js` extensions** in relative imports.
- Strict TypeScript; `verbatimModuleSyntax` is on, so use `import type` for type-only imports.
- Tool/resource/prompt registration functions are named `register<Name><Kind>`.
- Commits follow **Conventional Commits** (enforced by a commitlint `commit-msg` hook):
  `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, …
