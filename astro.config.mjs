// @ts-check
import { defineConfig } from 'astro/config';

// Served from GitHub Pages as a project site: https://djamart.github.io/diogo.martins/
// If a custom domain is added later, set `site` to it and remove `base`.
export default defineConfig({
  site: 'https://djamart.github.io',
  base: '/diogo.martins',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    // Add 'pt' here (and its strings in src/i18n/ui.ts) to publish a Portuguese version under /pt/.
    locales: ['en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
