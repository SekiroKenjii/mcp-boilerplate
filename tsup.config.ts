import { defineConfig } from 'tsup';

/**
 * Transpile-only build (bundle: false) that mirrors the `src/` tree into `dist/`.
 * Keeping the file structure means runtime-relative reads (e.g. package.json)
 * resolve identically in dev (`src/`) and in the build output (`dist/`), and
 * avoids known bundling pitfalls with pino's worker-thread transports.
 * Dependencies stay external and are resolved from node_modules at runtime.
 */
export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  bundle: false,
  clean: true,
  sourcemap: true,
  dts: false,
});
