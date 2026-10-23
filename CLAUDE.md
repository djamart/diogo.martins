# CLAUDE.md

Context for AI coding agents (and humans) working on this repository. Read this first; the skills in `.claude/skills/` hold the step-by-step procedures.

## What this is

The personal website of Diogo Martins, Quality Enablement Engineer. The audience is recruiters and technical hiring managers; the goal of every page is to make it easy to contact Diogo or open his LinkedIn or CV.

The site is also proof of how Diogo works: it is built like a product, every change passes automated quality gates, and the tests are written and maintained with AI agents guided by this file and the skills next to it. Treat the tests and the docs as part of the product, not as overhead.

- Stack: [Astro](https://astro.build) 7, TypeScript (strict), static output.
- Hosting: GitHub Pages under the base path `/diogo.martins/`. Live at https://djamart.github.io/diogo.martins/
- Content languages: English (default, at the root) and European Portuguese (pt-PT, under `/pt/`). Never hardcode user-facing text in a page; every string and profile text exists in both languages. The CV is in English only, by Diogo's choice. Portuguese uses pt-PT vocabulary (ecrã, telemóvel, contacto, ficheiro), never pt-BR.

## Project map

| Path                             | What lives there                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/pages/`                     | Pages in `[...locale]/` (built once per language), `404.astro`, and the CV endpoint             |
| `src/content/blog/`              | Blog posts in Markdown, `<lang>/<slug>.md`; schema in `src/content.config.ts`                   |
| `src/blog/`                      | Blog logic: post order, languages, dates (`posts.ts`) and the RSS feed (`rss.ts`)               |
| `src/layouts/`                   | `BaseLayout.astro`: header, navigation, skip link, footer                                       |
| `src/i18n/ui.ts`                 | Every user-facing string in every language, keyed by `section.name`                             |
| `src/data/profile.ts`            | Experience, certifications and contact links. Single source for the pages and the CV            |
| `src/cv/`                        | CV model (`model.ts`) and PDF layout (`pdf.ts`)                                                 |
| `src/quality/`                   | Build-time readers for the /quality page: CI reports, deploy history and skills                 |
| `src/styles/tokens.ts`           | Colour palette and themes, with the contrast pairs they must meet                               |
| `src/utils/`                     | Pure helpers (navigation, contrast, theme). Logic goes here so it can be unit tested            |
| `tests/unit/`                    | Vitest unit tests, one file per module                                                          |
| `e2e/`                           | Playwright specs, grouped by concern (smoke, navigation, layout, content, accessibility, theme) |
| `e2e/__screenshots__/`           | Approved screenshots for `e2e/visual.spec.ts`, one folder per Playwright project                |
| `e2e/pages/`                     | Page objects, one per page, all extending `SitePage`. `SitePage.ts` holds `sitePages`           |
|                                  | (every menu page, both languages); `PostPage.ts` holds `postPages`, read from the blog          |
| `e2e/pages/components/`          | Parts shared by every page: header, theme and language menus, footer, `<head>` links            |
| `lighthouserc.json`              | Lighthouse CI: the pages it audits and the minimum scores                                       |
| `scripts/lighthouse.mjs`         | Runs Lighthouse CI; `LIGHTHOUSE_SHARD` splits the pages between CI jobs                         |
| `scripts/check-links.mjs`        | Link check on the build (linkinator), with the links it skips and why                           |
| `scripts/update-screenshots.mjs` | Renders the visual baselines in the Playwright Docker image CI uses                             |
| `docs/test-plan.md`              | Scope, risks, test levels and phase gates                                                       |
| `.github/workflows/ci.yml`       | The quality gates, deploy and live smoke test                                                   |

## Quality gates

A change is done when all of these pass. CI runs them on every pull request; `main` deploys only when they are green, and then a smoke test runs against the live site.

```sh
npm run lint            # ESLint
npm run format:check    # Prettier (run `npm run format` to fix)
npm run check           # astro check: TypeScript and .astro templates
npm run test:coverage   # Vitest, 80% minimum for lines, branches, functions and statements
npm run build && npm run test:e2e   # Playwright E2E + axe, against the production build
npm run test:lighthouse # Lighthouse CI on every page, 95 minimum in all four categories (after a build)
npm run test:links      # linkinator: every link on the build resolves (after a build)
```

E2E runs in Chromium, Firefox and WebKit (one CI job per browser), and on phones: `mobile-chrome` (Pixel 7) in the Chromium job and `mobile-safari` (iPhone 15) in the WebKit job. `e2e/mobile.spec.ts` (reflow at 320 px, tap targets, touch) runs only in the phone projects. `e2e/visual.spec.ts` compares every English page, in light and dark, with its approved screenshot, in `chromium` and `mobile-chrome` only; the smoke test on the live site leaves it out. Locally, pick one with `-- --project=chromium`.

A new page must also be added to `lighthouserc.json`, in both languages, and so must every published blog post; a unit test fails until it is.

Never weaken a gate to get green: do not lower the coverage threshold or a Lighthouse score, skip or `.only` a test, loosen an assertion until it passes, or filter out an axe violation, or skip a link that is really broken. If a gate is wrong, say so and fix it in its own change.

## Testing conventions

Pick the lowest test level that can catch the regression (see the test plan):

- **Unit (Vitest)** for anything with logic: data rules, formatting, URL building, contrast, the CV model and PDF. Pure functions in `src/` with a matching `tests/unit/<module>.test.ts`.
- **E2E (Playwright)** for what a visitor sees and does: pages load, navigation, links, downloads, keyboard access.
- **Visual regression (Playwright screenshots)** catches a change in the look that no other test asserts: spacing, colours, fonts, overlaps. A new menu page gets it once it is in `sitePages`. When a pull request changes the look on purpose, run `npm run test:visual:update` (needs Docker) and commit the new PNGs; reviewing them in the diff is the approval. Never regenerate them outside that script, because fonts render differently on every machine, and never raise the comparison threshold to get green.
- **Accessibility (axe)** runs automatically on every page in `sitePages`, in light and dark themes. A new page gets it for free once it is listed there. Blog posts need no listing: `postPages` is read from `src/content/blog`, so a new post gets the blog, axe and phone tests on its own.

Rules that keep the suites readable and stable:

- Test names describe behaviour in plain English (`'experience lists roles from the most recent'`), never implementation.
- Locate elements the way a user would: `getByRole` with an accessible name first, then `getByTestId` for things without a good role. No CSS or XPath selectors for behaviour.
- Add a `data-testid` to the markup only when a role-based locator would be ambiguous. Use kebab-case, named after what the element is (`contact-email`, `cta-cv`).
- Use web-first assertions (`await expect(locator).toHaveText(...)`). No `waitForTimeout`, no manual retries.
- Navigate with relative URLs (`'./'`, `'./about/'`) so the same tests run against the local build and the live site (`BASE_URL`).
- Follow the Page Object Model. Specs never locate elements on `page` directly: every locator and every action a visitor takes (open a page, choose a theme, download the CV) lives in a page object under `e2e/pages/`, and specs hold the assertions. Page objects never assert.
- One page object per page, extending `SitePage` and setting the `path` its `goto()` opens. Parts every page shares are components in `e2e/pages/components/`, reached through the page (`site.header.themeMenu`, `site.footer`, `site.head`), never built by a spec.
- Assert on content from `src/data/profile.ts` or `src/i18n/ui.ts` where it matters, so a content change that breaks a promise (e.g. no phone number) fails a test.
- Every bug fix comes with a test that fails before the fix and passes after it.

## Content rules

These are deliberate decisions; tests enforce several of them.

- Title is "Quality Enablement Engineer"; the three pillars are test automation, quality engineering and AI-driven testing.
- No phone number anywhere, including the CV. Contact is email (mailto), LinkedIn, GitHub and the CV PDF.
- CVEs can be mentioned, but never their identifiers.
- No Education section; certifications take its place.
- A blog post may exist in one language only. The other language's blog index lists it with a note on its language, and the language menu leads to that blog index instead.
- The accent colour is cinnabar in both themes, the CV and the favicon, used only on large text, underlines and focus rings to keep contrast at WCAG AA.

## Working agreements

- Keep changes small and focused, one concern per pull request. Fill in the pull request template, including how it was tested.
- Commit messages say what changed for the visitor or developer, in the imperative.
- Code, comments, docs and commit messages are in English.
- Match the surrounding code: comment density, naming and idioms. Prettier settings are in `.prettierrc.json`.

## Skills

Procedures for recurring work, in `.claude/skills/`:

| Skill                      | Use it to                                                                    |
| -------------------------- | ---------------------------------------------------------------------------- |
| `write-e2e-test`           | Add or change Playwright tests for a page, flow or link                      |
| `write-unit-test`          | Add or change Vitest tests for logic in `src/`                               |
| `add-page`                 | Add a new page with navigation, strings and full test coverage               |
| `fix-bug-with-test`        | Reproduce a bug as a failing test, fix it, and keep the test as a regression |
| `investigate-failing-test` | Diagnose a red or flaky test in CI or locally without weakening it           |
| `write-blog-post`          | Add a blog post in one or both languages, with the checks it needs           |

## Environment notes

- `astro preview` in Astro 7 backgrounds itself when it detects an agent; the Playwright web server passes `--ignore-lock` to keep it in the foreground. Keep that flag.
- The /quality page reads CI results from `reports/` at build time. Locally that folder is usually absent and the page says so; the deploy build sets `REQUIRE_QUALITY_REPORT=true`, so a missing report fails the deploy instead of shipping an empty page.
- The trend on /quality comes from `quality-history.json`, which the site publishes. The deploy job downloads the live copy into `reports/history.json` and the build adds its own run (`src/quality/history.ts`), so the history needs no commits or storage outside the site. Locally there is none and the section is left out.
- If the installed Playwright browsers do not match the `@playwright/test` version (common in sandboxed containers), run locally with a throwaway config that sets `use.launchOptions.executablePath` to the available Chromium. Do not commit it; CI runs E2E in the official Playwright image (`mcr.microsoft.com/playwright`), tagged with the locked `@playwright/test` version, so its browsers always match.
