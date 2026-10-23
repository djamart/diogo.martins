# diogo.martins

Personal website of Diogo Martins, QA engineer, built with [Astro](https://astro.build) and tested like a product.

Live site: https://djamart.github.io/diogo.martins/

## Quality gates

Every pull request runs:

- ESLint, Prettier and `astro check` (TypeScript)
- Vitest unit tests with an 80% coverage threshold
- Playwright end-to-end and accessibility tests against the production build, in Chromium, Firefox and WebKit

Merges to `main` deploy to GitHub Pages only when all checks pass, then a smoke test runs against the live site. See the [test plan](docs/test-plan.md) for scope, risks and phase gates.

## Getting started

Requires Node.js 22 (see `.nvmrc`).

```sh
npm install
npm run dev          # local dev server at http://localhost:4321/diogo.martins/
```

| Command                 | What it does                               |
| ----------------------- | ------------------------------------------ |
| `npm run build`         | Builds the static site into `dist/`        |
| `npm run preview`       | Serves the production build locally        |
| `npm run lint`          | Runs ESLint                                |
| `npm run format`        | Formats the code with Prettier             |
| `npm run check`         | Type-checks the project with `astro check` |
| `npm test`              | Runs unit tests                            |
| `npm run test:coverage` | Runs unit tests with a coverage report     |
| `npm run test:e2e`      | Runs Playwright E2E tests on the build     |

The E2E tests run in all three browsers; to run a single one, add `-- --project=firefox` (or `chromium`, `webkit`). To run them against a deployed site: `BASE_URL=https://djamart.github.io/diogo.martins/ npm run test:e2e`.

## Working with AI agents

The tests on this site are written and maintained with AI agents, under the same quality gates as any other change. The context they work from is part of the repository:

- [`CLAUDE.md`](CLAUDE.md): what the project is, how it is laid out, the quality gates, testing conventions and content rules.
- [`.claude/skills/`](.claude/skills/): step-by-step procedures for recurring work: writing E2E and unit tests, adding a page with full coverage, fixing a bug test-first, and investigating a failing test.

The agent proposes the change; the gates decide whether it ships.

## CV

The CV at `/diogo-martins-cv.pdf` is generated at build time from the same data as the site (`src/data/profile.ts`), so the PDF and the pages never drift apart. The layout lives in `src/cv/pdf.ts` (PDFKit, built-in fonts) and unit tests read the text back from the PDF to check its content.

## Translations

The site is in English and ready for more languages. To add Portuguese:

1. Add `'pt'` to `locales` in `astro.config.mjs`.
2. Add a `pt` entry to `languages` and `ui` in `src/i18n/ui.ts`.
3. Add the translated pages under `src/pages/pt/`.

Missing strings fall back to English.
