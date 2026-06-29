import { defineConfig } from 'tsup';

export default defineConfig({
  // Two entries → two chunks. The `rxjs` barrel is the ONLY place that imports
  // rxjs; the core `index` chunk stays rxjs-free, so importing '@illuma/lifecycle'
  // never pulls rxjs. tsup auto-externalizes peerDependencies (rxjs, @illuma/core),
  // so they're left as bare imports rather than inlined into the bundle.
  entry: {
    index: 'src/index.ts',
    rxjs: 'src/lib/rxjs/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: 'terser',
  terserOptions: {
    format: {
      // Preserve JSDoc blocks (/** ... */) and bang-comments so hover docs
      // survive for plain-JS consumers. terser drops the surrounding /* */.
      comments: /^[*!]|@preserve|@license|@cc_on|@__PURE__/i,
    },
  },
});
