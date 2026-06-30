import { z } from 'zod';

/**
 * Parse a boolean from an env string. `z.coerce.boolean()` is unsafe here —
 * it treats any non-empty string (including "false") as `true`.
 */
const booleanFromEnv = z
  .enum(['true', 'false', '1', '0'])
  .default('false')
  .transform((value) => value === 'true' || value === '1');

/**
 * Runtime configuration, parsed once from `process.env` at startup.
 * Validation failures abort the process with a readable message — fail fast
 * rather than discovering a bad config deep inside a request handler.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MCP_TRANSPORT: z.enum(['stdio', 'http']).default('stdio'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  ALLOWED_HOSTS: z.string().default('127.0.0.1,localhost'),
  CORS_ORIGINS: z.string().default(''),

  // ── Optional bearer auth for the HTTP transport ────────────────────────────
  AUTH_ENABLED: booleanFromEnv,
  // Static tokens accepted by the example verifier (replace with real OAuth/JWT).
  AUTH_TOKENS: z.string().default(''),
  // Scopes every token must carry (comma-separated). Empty = no scope requirement.
  AUTH_REQUIRED_SCOPES: z.string().default(''),
  // Optional Protected Resource Metadata URL advertised in 401 WWW-Authenticate.
  AUTH_RESOURCE_METADATA_URL: z.string().default(''),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    // The logger depends on this module, so write directly to stderr here.
    process.stderr.write(`Invalid environment configuration:\n${issues}\n`);
    process.exit(1);
  }
  return result.data;
}

export const env: Env = loadEnv();

/** Split a comma-separated env value into a trimmed, non-empty list. */
export function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
