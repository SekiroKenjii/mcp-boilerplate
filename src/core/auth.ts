import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import { type OAuthTokenVerifier } from '@modelcontextprotocol/sdk/server/auth/provider.js';
import { type AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { InvalidTokenError } from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { type RequestHandler } from 'express';

import { env, parseList } from '../config/env.js';
import { logger } from './logger.js';

const TOKEN_TTL_SECONDS = 3600;

/**
 * Example token verifier: validates the bearer token against a static allowlist
 * (`AUTH_TOKENS`). It is intentionally trivial — **replace `verifyAccessToken`
 * with real JWT verification or OAuth token introspection** for production.
 *
 * `requireBearerAuth` requires a numeric `expiresAt`; since static tokens do not
 * expire, we hand out a rolling TTL on each successful verification.
 */
class StaticTokenVerifier implements OAuthTokenVerifier {
  private readonly tokens: ReadonlySet<string>;
  private readonly scopes: readonly string[];

  constructor(tokens: string[], scopes: string[]) {
    this.tokens = new Set(tokens);
    this.scopes = scopes;
  }

  verifyAccessToken(token: string): Promise<AuthInfo> {
    if (!this.tokens.has(token)) {
      // requireBearerAuth converts InvalidTokenError into a 401 response.
      return Promise.reject(new InvalidTokenError('Invalid access token'));
    }
    return Promise.resolve({
      token,
      clientId: 'static-token',
      scopes: [...this.scopes],
      expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    });
  }
}

/**
 * Build the bearer-auth Express middleware when `AUTH_ENABLED=true`, otherwise
 * `null` (the HTTP transport stays unauthenticated). Apply the result to `/mcp`.
 */
export function createAuthMiddleware(): RequestHandler | null {
  if (!env.AUTH_ENABLED) {
    return null;
  }

  const tokens = parseList(env.AUTH_TOKENS);
  const requiredScopes = parseList(env.AUTH_REQUIRED_SCOPES);
  if (tokens.length === 0) {
    logger.warn('AUTH_ENABLED is true but AUTH_TOKENS is empty: no token can authenticate');
  }

  return requireBearerAuth({
    verifier: new StaticTokenVerifier(tokens, requiredScopes),
    ...(requiredScopes.length > 0 ? { requiredScopes } : {}),
    ...(env.AUTH_RESOURCE_METADATA_URL
      ? { resourceMetadataUrl: env.AUTH_RESOURCE_METADATA_URL }
      : {}),
  });
}
