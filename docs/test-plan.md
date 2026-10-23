# Test plan

This site is built like a product: every change goes through automated quality gates before it reaches production. This document describes what is tested, how, and when a change is allowed to ship.

## Scope

In scope:

- All public pages, in every published language.
- Navigation, links, downloads and the contact form (from phase 1).
- Accessibility, performance, SEO basics and visual consistency (from phase 2).

Out of scope:

- Third-party services the site links to (GitHub, LinkedIn, form providers), beyond checking that links resolve.
- Browsers older than the last two major versions.

## Risks

| Risk                                                      | Impact | Mitigation                                     |
| --------------------------------------------------------- | ------ | ---------------------------------------------- |
| A broken deploy takes the site down                       | High   | Deploy only from green `main`, live smoke test |
| Broken links or a missing CV download                     | High   | E2E tests, linkinator on every build           |
| Pages unusable with a keyboard or screen reader           | High   | axe accessibility checks on every page         |
| Pages broken or hard to tap on a phone                    | High   | E2E and axe on Pixel 7 and iPhone 15, 320 px   |
| The chosen theme is lost or flashes the other one on load | Medium | E2E theme tests, axe in both chosen themes     |
| A translation is missing and the page shows an empty text | Medium | Typed translation keys, unit tests             |
| A Portuguese page drifts from its English twin            | Medium | Every suite loops over both languages          |
| Unintended visual changes                                 | Medium | Visual regression snapshots (phase 2)          |
| Slow pages hurt first impressions and SEO                 | Medium | Lighthouse CI, 95 minimum on every page        |
| Vulnerable dependencies                                   | Low    | Dependabot, `npm audit`                        |

## Test levels

| Level             | Tool                                | Runs on              | Phase |
| ----------------- | ----------------------------------- | -------------------- | ----- |
| Static analysis   | ESLint, Prettier, `astro check`     | Every PR and `main`  | 0     |
| Unit              | Vitest (80% coverage threshold)     | Every PR and `main`  | 0     |
| End-to-end        | Playwright (Page Object Model)      | Every PR and `main`  | 0     |
| Live smoke        | Playwright against the live URL     | After every deploy   | 0     |
| Accessibility     | `@axe-core/playwright`              | Every PR and `main`  | 1     |
| Cross-browser     | Playwright: Firefox, WebKit, mobile | Every PR and `main`  | 1, 2  |
| Visual regression | Playwright `toHaveScreenshot`       | Every PR and `main`  | 2     |
| Performance, SEO  | Lighthouse CI                       | Every PR and `main`  | 2     |
| Links             | linkinator                          | Every PR and `main`  | 2     |
| HTML validity     | html-validate                       | Every PR and nightly | 2     |

## Entry and exit criteria

A pull request can be merged when:

- All CI checks are green.
- New behaviour is covered by tests at the lowest level that can catch a regression.
- Acceptance criteria from the linked story are met.

A deploy is considered successful when the live smoke test passes.

## Phase gates

| Phase              | Exit criterion                                                    |
| ------------------ | ----------------------------------------------------------------- |
| 0. Foundations     | Site is live on GitHub Pages and CI is green                      |
| 1. MVP             | Every page covered by E2E tests, zero serious axe violations      |
| 2. Visible quality | Lighthouse 95 or higher in all four categories, reports published |
| 3. Blog and extras | Blog published, nightly checks running                            |

## Defect management

Bugs are filed with the bug report template, which captures steps to reproduce, expected and actual results, environment and severity. A fix comes with a test that fails before the fix and passes after it.
