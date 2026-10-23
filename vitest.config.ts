import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // In CI the results also go to reports/, where the /quality page reads them at build time.
    reporters: process.env.CI ? ['default', 'json'] : ['default'],
    outputFile: { json: 'reports/unit.json' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
