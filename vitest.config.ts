import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.ts'],
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['json-summary', 'text'],
      reportsDirectory: 'artifacts/coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{d,types}.ts',
        'src/**/types.ts',
        'src/**/index.ts',
        'src/test-setup.ts',
        'vitest.config.ts'
      ]
    },
  },
});
