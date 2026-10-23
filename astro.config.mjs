// @ts-check
import { defineConfig } from 'astro/config';

// Served from GitHub Pages as a project site: https://djamart.github.io/diogo.martins/
// If a custom domain is added later, set `site` to it and remove `base`.
export default defineConfig({
  markdown: {
    // Code blocks use the theme colours (see global.css), which the contrast tests check.
    syntaxHighlight: false,
  },
  site: 'https://djamart.github.io',
  base: '/diogo.martins',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    // European Portuguese under /pt/. Pages live in src/pages/[...locale]/; strings in src/i18n/ui.ts.
    locales: ['en', 'pt'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
