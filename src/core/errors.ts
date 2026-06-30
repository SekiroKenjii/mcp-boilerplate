import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Application-level error carrying a machine-readable code.
 * Throw inside tool handlers, then convert with {@link toToolError} so the
 * client receives a structured, non-fatal error instead of a transport crash.
 */
export class AppError extends Error {
  public readonly code: string;

  constructor(message: string, options?: { code?: string; cause?: unknown }) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'AppError';
    this.code = options?.code ?? 'INTERNAL_ERROR';
  }
}

/**
 * Convert any thrown value into a `CallToolResult` flagged as an error.
 * Tools should return this rather than throwing, so a single failing call does
 * not tear down the session.
 */
export function toToolError(error: unknown): CallToolResult {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
  const code = error instanceof AppError ? error.code : 'INTERNAL_ERROR';

  return {
    isError: true,
    content: [{ type: 'text', text: `[${code}] ${message}` }],
  };
}
