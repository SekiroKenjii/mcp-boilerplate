# MCP Server Boilerplate

A production-grade starting point for building **[Model Context Protocol](https://modelcontextprotocol.io) (MCP) servers** in native TypeScript. Clean enough for a weekend project, hardened enough for an enterprise deployment.

- ⚡️ **Native TypeScript**, strict, ESM (`NodeNext`)
- 🔌 **Two transports** out of the box — **stdio** (local clients) and **Streamable HTTP** (remote/hosted) with session management
- 🧱 **Modular structure** — one file per tool / resource / prompt, aggregated automatically
- ✅ **Zod-validated** tool I/O and environment config
- 🪵 **Structured logging** (pino) to **stderr only**, so stdio JSON-RPC stays clean
- 🛡️ **DNS-rebinding protection** (Host-header validation) + CORS + optional **bearer auth**
- 🧪 **Vitest** with fast in-memory client↔server tests
- 🧹 **ESLint (type-checked) + Prettier + Husky** pre-commit hooks
- 🐳 **Multi-stage Dockerfile** for the HTTP transport
- 🤖 **Claude Code tooling** — `CLAUDE.md`, skills, and slash commands baked in

## Requirements

- Node.js `>= 22.13` (required by pnpm 11)
- [pnpm](https://pnpm.io) `>= 11` (`corepack enable` will provide it)

## Quick start

```bash
pnpm install
cp .env.example .env

# Local (stdio) development with hot reload
pnpm dev

# Remote (Streamable HTTP) development with hot reload
pnpm dev:http
```

Then build and run the compiled server:

```bash
pnpm build
pnpm start        # stdio
pnpm start:http   # Streamable HTTP on http://127.0.0.1:3000/mcp
```

## Transports

The transport is chosen by the `--transport` CLI flag (which overrides the `MCP_TRANSPORT`
env var), defaulting to `stdio`:

- **stdio** — the client spawns the server and speaks JSON-RPC over stdin/stdout. Use this for
  Claude Desktop, IDEs, and other local integrations.
- **Streamable HTTP** — an Express server at `POST/GET/DELETE /mcp` with per-session transports
  and a `GET /healthz` liveness endpoint. Use this for remote/hosted deployments.

### Connect from Claude Desktop (stdio)

```jsonc
{
  "mcpServers": {
    "mcp-boilerplate": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
    },
  },
}
```

### Authentication (HTTP)

The HTTP transport is unauthenticated by default (protected by `ALLOWED_HOSTS`). To require a
bearer token, set `AUTH_ENABLED=true` and provide `AUTH_TOKENS`:

```bash
AUTH_ENABLED=true AUTH_TOKENS=my-secret-token pnpm start:http
# Requests to /mcp without "Authorization: Bearer my-secret-token" get 401.
```

The bundled verifier in [src/core/auth.ts](src/core/auth.ts) checks a static token allowlist —
**replace `verifyAccessToken` with real JWT verification or OAuth token introspection** for
production. The validated `AuthInfo` is available to tool handlers via `extra.authInfo`.

## Configuration

All configuration is environment-based and validated at startup (see [.env.example](.env.example)):

| Variable                     | Default               | Description                                                            |
| ---------------------------- | --------------------- | ---------------------------------------------------------------------- |
| `MCP_TRANSPORT`              | `stdio`               | `stdio` or `http` (CLI `--transport` wins)                             |
| `HOST`                       | `127.0.0.1`           | HTTP bind address                                                      |
| `PORT`                       | `3000`                | HTTP port                                                              |
| `ALLOWED_HOSTS`              | `127.0.0.1,localhost` | Allowed `Host` hostnames (port-agnostic). Empty disables protection.   |
| `CORS_ORIGINS`               | _(empty)_             | Comma-separated CORS origins for browser clients. Empty disables CORS. |
| `AUTH_ENABLED`               | `false`               | Require a bearer token on `/mcp` (HTTP transport).                     |
| `AUTH_TOKENS`                | _(empty)_             | Comma-separated tokens accepted by the example verifier.               |
| `AUTH_REQUIRED_SCOPES`       | _(empty)_             | Comma-separated scopes every token must carry.                         |
| `AUTH_RESOURCE_METADATA_URL` | _(empty)_             | Protected Resource Metadata URL advertised in 401 responses.           |
| `LOG_LEVEL`                  | `info`                | `fatal`…`trace`/`silent`                                               |
| `NODE_ENV`                   | `development`         | `production` emits plain JSON logs                                     |

## Project structure

```
src/
  index.ts          Entrypoint: transport resolution + graceful shutdown
  server.ts         createServer(): builds McpServer, registers everything
  config/env.ts     Zod-validated environment configuration
  core/             logger (stderr), errors (AppError + toToolError), pkg (name/version)
  transports/       stdio.ts, http.ts (Express + Streamable HTTP)
  tools/            echo.tool.ts + index.ts aggregator
  resources/        system-info.resource.ts + index.ts aggregator
  prompts/          summarize.prompt.ts + index.ts aggregator
tests/              Vitest, in-memory client↔server (helpers/connect.ts)
```

## Adding features

Adding a feature is always: **new file + one import line** in the folder's `index.ts`.

```bash
# With Claude Code:
/new-tool weather "get the forecast for a city"
/new-resource changelog "expose CHANGELOG.md"
/new-prompt review "ask the model to review a diff"
```

Or by hand — copy `src/tools/echo.tool.ts`, define Zod schemas, register it in
`src/tools/index.ts`, and add a test. See [CLAUDE.md](CLAUDE.md) for the full conventions.

## Testing & inspecting

```bash
pnpm test            # run once
pnpm test:watch      # watch mode
pnpm test:coverage   # coverage report
pnpm inspector       # launch the MCP Inspector against the server over stdio
```

## Docker (HTTP transport)

```bash
docker build -t mcp-boilerplate .
docker run --rm -p 3000:3000 \
  -e ALLOWED_HOSTS=localhost,127.0.0.1 \
  mcp-boilerplate

# or with Docker Compose (includes a healthcheck):
docker compose up --build
```

## Commits & releases

- **Conventional Commits** are enforced by a `commit-msg` hook (commitlint). Use
  `feat:`, `fix:`, `chore:`, `docs:`, etc. — e.g. `feat(tools): add weather tool`.
- **Versioning** uses [changesets](https://github.com/changesets/changesets):
  `pnpm changeset` to record a change, `pnpm changeset:version` to bump + update the changelog,
  `pnpm changeset:release` to publish.

## Claude Code tooling

This repo ships agent tooling under [.claude/](.claude/) and [CLAUDE.md](CLAUDE.md):

- **`karpathy-guidelines`** skill — behavioral guardrails (think first, stay simple, surgical
  changes, verify) vendored from
  [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills).
- **`mcp-add-tool` / `mcp-add-resource` / `mcp-add-prompt`** skills — encode this repo's exact
  patterns so new features stay consistent.
- **`/new-tool` / `/new-resource` / `/new-prompt`** slash commands.
- **`settings.json`** — a permission allowlist for the common project commands.

## Scripts

| Script                                                 | Description                          |
| ------------------------------------------------------ | ------------------------------------ |
| `pnpm dev` / `pnpm dev:http`                           | Watch-mode dev (stdio / HTTP)        |
| `pnpm build`                                           | Transpile `src/` → `dist/` with tsup |
| `pnpm start` / `pnpm start:http`                       | Run the built server                 |
| `pnpm typecheck`                                       | `tsc --noEmit`                       |
| `pnpm lint` / `pnpm lint:fix`                          | ESLint (type-checked)                |
| `pnpm format` / `pnpm format:check`                    | Prettier                             |
| `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` | Vitest                               |
| `pnpm inspector`                                       | MCP Inspector over stdio             |

## License

MIT
