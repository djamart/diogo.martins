---
name: add-page
description: Add a new page to the site with its navigation entry, translated strings, and unit, E2E and accessibility coverage. Use when asked to create a page such as /quality or /blog.
---

# Add a page

A page is done when it is reachable from the menu, all of its text is in the i18n strings, and the existing suites cover it: navigation, accessibility in both themes, and the content it promises.

## 1. Strings

Add every user-facing string to both `en` and `pt` in `src/i18n/ui.ts`, keyed `<page>.<name>` (e.g. `quality.title`, `quality.intro`), plus a `nav.<page>` label if it goes in the menu. Portuguese is European Portuguese (pt-PT). Never hardcode text in the `.astro` file. `astro check` fails on a key missing from `pt`, and `tests/unit/i18n.test.ts` on an empty string.

## 2. The page

Create `src/pages/[...locale]/<page>.astro` following the existing pages, so it is built at `/<page>/` and `/pt/<page>/`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getLangFromUrl, localeStaticPaths, useTranslations } from '../../i18n/utils';

export const getStaticPaths = localeStaticPaths;

const lang = getLangFromUrl(Astro.url, import.meta.env.BASE_URL);
const t = useTranslations(lang);
---

<BaseLayout title={t('quality.title')}>
  <h1>{t('quality.title')}</h1>
</BaseLayout>
```

- Exactly one `<h1>`, then headings in order without skipping levels.
- Build links to other pages with `pageHref(base, path, lang)` and to files with `fileHref` from `src/utils/nav.ts`; never hardcode `/diogo.martins/` or `/pt/`.
- Data shown on the page (lists, dates, links) goes in `src/data/`, not in the template, so it can be unit tested and reused by the CV.
- Use colours from the theme variables only; accents only on large text, underlines and focus.

## 3. Navigation

If the page belongs in the menu, add it to `navItems` in `src/utils/nav.ts` in the order it should appear. `nav.test.ts` checks every item has a label.

## 4. Tests

1. Add the page to `sitePages` in `e2e/pages/SitePage.ts` once per language, with its path, menu name and expected heading. This alone gives it the language switch and `hreflang` checks (`language.spec.ts`), the navigation tests (loads with 200, marked as current, reachable from the menu) and axe checks in light and dark themes.
2. Add the page's URL to `collect.url` in `lighthouserc.json` in both languages, in menu order, so Lighthouse audits it. `quality.test.ts` fails until every menu page is there. The link check finds the page on its own by following the menu.
3. Add a page object in `e2e/pages/<Name>Page.ts` that extends `SitePage`, sets `path` and holds the locators of the page's own content. Then add tests in `e2e/content.spec.ts` for what the page promises a visitor (follow `write-e2e-test`).
4. Add unit tests for any new logic or data in `src/` (follow `write-unit-test`).
5. If the page must work on the live site after every deploy, add a check to `smoke.spec.ts`.

## 5. Verify

```sh
npm run lint && npm run format:check && npm run check
npm run test:coverage
npm run build && npm run test:e2e -- --project=chromium
npm run test:lighthouse && npm run test:links
```

Open the page in `npm run dev` at desktop and mobile widths, with the keyboard only, and in both themes. Note this in the "How it was tested" section of the pull request.
