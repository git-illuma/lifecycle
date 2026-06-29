import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
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
