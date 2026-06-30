import { readFileSync } from 'node:fs';

import { z } from 'zod';

/**
 * Server identity, read from package.json so name/version have a single source
 * of truth. The build keeps the `src/` tree structure (see tsup.config.ts), so
 * the relative path resolves the same in dev and in `dist/`.
 */
const PackageInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
});

const packageJsonUrl = new URL('../../package.json', import.meta.url);
const raw: unknown = JSON.parse(readFileSync(packageJsonUrl, 'utf8'));

export const packageInfo = PackageInfoSchema.parse(raw);
