// @ts-check
import { defineConfig } from 'astro/config';
import { deployTarget } from './src/utils/deployTarget.ts';

// Served from GitHub Pages as a project site (https://djamart.github.io/diogo.martins/) by default,
// and from the root of its domain on Vercel. See src/utils/deployTarget.ts for the variables.
const { site, base } = deployTarget(process.env);

export default defineConfig({
  markdown: {
    // Code blocks use the theme colours (see global.css), which the contrast tests check.
    syntaxHighlight: false,
  },
  site,
  base,
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
