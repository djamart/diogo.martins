# CLAUDE.md

Context for AI coding agents (and humans) working on this repository. Read this first; the skills in `.claude/skills/` hold the step-by-step procedures.

## What this is

The personal website of Diogo Martins, Quality Enablement Engineer. The audience is recruiters and technical hiring managers; the goal of every page is to make it easy to contact Diogo or open his LinkedIn or CV.

The site is also proof of how Diogo works: it is built like a product, every change passes automated quality gates, and the tests are written and maintained with AI agents guided by this file and the skills next to it. Treat the tests and the docs as part of the product, not as overhead.

- Stack: [Astro](https://astro.build) 7, TypeScript (strict), static output.
- Hosting: GitHub Pages under the base path `/diogo.martins/`. Live at https://djamart.github.io/diogo.martins/
- Content language: English. The site is i18n-ready (see the README); never hardcode user-facing text in a page.

## Project map

| Path                       | What lives there                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `src/pages/`               | One `.astro` file per page, plus `diogo-martins-cv.pdf.ts` (the CV, built at build time) |
| `src/layouts/`             | `BaseLayout.astro`: header, navigation, skip link, footer                                |
| `src/i18n/ui.ts`           | Every user-facing string, keyed by `section.name`                                        |
| `src/data/profile.ts`      | Experience, certifications and contact links. Single source for the pages and the CV     |
| `src/cv/`                  | CV model (`model.ts`) and PDF layout (`pdf.ts`)                                          |
| `src/quality/`             | Build-time readers for the /quality page: CI test reports (`report.ts`) and skills       |
| `src/styles/tokens.ts`     | Colour palette and themes, with the contrast pairs they must meet                        |
| `src/utils/`               | Pure helpers (navigation, contrast, theme). Logic goes here so it can be unit tested     |
| `tests/unit/`              | Vitest unit tests, one file per module                                                   |
| `e2e/`                     | Playwright specs, grouped by concern (smoke, navigation, content, accessibility, theme)  |
| `e2e/pages/`               | Page objects. `SitePage.ts` holds `sitePages`, the list every page-level suite loops on  |
| `lighthouserc.json`        | Lighthouse CI: the pages it audits and the minimum scores                                |
| `scripts/check-links.mjs`  | Link check on the build (linkinator), with the links it skips and why                    |
| `docs/test-plan.md`        | Scope, risks, test levels and phase gates                                                |
| `.github/workflows/ci.yml` | The quality gates, deploy and live smoke test                                            |

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

E2E runs in Chromium, Firefox and WebKit (one CI job per browser). Locally, pick one with `-- --project=chromium`.

A new page must also be added to `lighthouserc.json`; a unit test fails until it is.

Never weaken a gate to get green: do not lower the coverage threshold or a Lighthouse score, skip or `.only` a test, loosen an assertion until it passes, or filter out an axe violation, or skip a link that is really broken. If a gate is wrong, say so and fix it in its own change.

## Testing conventions

Pick the lowest test level that can catch the regression (see the test plan):

- **Unit (Vitest)** for anything with logic: data rules, formatting, URL building, contrast, the CV model and PDF. Pure functions in `src/` with a matching `tests/unit/<module>.test.ts`.
- **E2E (Playwright)** for what a visitor sees and does: pages load, navigation, links, downloads, keyboard access.
- **Accessibility (axe)** runs automatically on every page in `sitePages`, in light and dark themes. A new page gets it for free once it is listed there.

Rules that keep the suites readable and stable:

- Test names describe behaviour in plain English (`'experience lists roles from the most recent'`), never implementation.
- Locate elements the way a user would: `getByRole` with an accessible name first, then `getByTestId` for things without a good role. No CSS or XPath selectors for behaviour.
- Add a `data-testid` to the markup only when a role-based locator would be ambiguous. Use kebab-case, named after what the element is (`contact-email`, `cta-cv`).
- Use web-first assertions (`await expect(locator).toHaveText(...)`). No `waitForTimeout`, no manual retries.
- Navigate with relative URLs (`'./'`, `'./about/'`) so the same tests run against the local build and the live site (`BASE_URL`).
- Shared locators and navigation belong in a page object under `e2e/pages/`; specs hold the assertions.
- Assert on content from `src/data/profile.ts` or `src/i18n/ui.ts` where it matters, so a content change that breaks a promise (e.g. no phone number) fails a test.
- Every bug fix comes with a test that fails before the fix and passes after it.

## Content rules

These are deliberate decisions; tests enforce several of them.

- Title is "Quality Enablement Engineer"; the three pillars are test automation, quality engineering and AI-driven testing.
- No phone number anywhere, including the CV. Contact is email (mailto), LinkedIn, GitHub and the CV PDF.
- CVEs can be mentioned, but never their identifiers.
- No Education section; certifications take its place.
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

## Environment notes

- `astro preview` in Astro 7 backgrounds itself when it detects an agent; the Playwright web server passes `--ignore-lock` to keep it in the foreground. Keep that flag.
- The /quality page reads CI results from `reports/` at build time. Locally that folder is usually absent and the page says so; the deploy build sets `REQUIRE_QUALITY_REPORT=true`, so a missing report fails the deploy instead of shipping an empty page.
- If the installed Playwright browsers do not match the `@playwright/test` version (common in sandboxed containers), run locally with a throwaway config that sets `use.launchOptions.executablePath` to the available Chromium. Do not commit it; CI installs the right browsers.
