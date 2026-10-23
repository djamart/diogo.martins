---
name: write-e2e-test
description: Add or change Playwright end-to-end tests for a page, a visitor flow, a link or a download on this site. Use when a change affects what a visitor sees or does in the browser.
---

# Write an E2E test

End-to-end tests prove the site works for a visitor, in Chromium, Firefox and WebKit, against the production build and the live site. They are the slowest level, so they cover behaviour that only a browser can show. Logic that can be checked without a browser belongs in a unit test (see `write-unit-test`).

## 1. Decide what to prove

Write the behaviour as one sentence from the visitor's point of view before writing code, e.g. "the contact page offers email, LinkedIn and GitHub, and no phone number". If the change came from a user story, each acceptance scenario usually becomes one test.

Check the existing specs first; extend a test rather than adding a near-duplicate.

| Spec                    | Covers                                                          |
| ----------------------- | --------------------------------------------------------------- |
| `smoke.spec.ts`         | The few checks that must pass on the live site after a deploy   |
| `navigation.spec.ts`    | Every page loads, menu, skip link, calls to action              |
| `content.spec.ts`       | Content promises: role, experience order, contacts, CV download |
| `accessibility.spec.ts` | axe on every page in `sitePages`, light and dark themes         |
| `theme.spec.ts`         | Light/dark toggle: system default, remembered choice, keyboard  |

Only add to `smoke.spec.ts` if a failure would mean the live site is broken for everyone. A new concern that does not fit these gets its own `<concern>.spec.ts`.

## 2. Locate elements like a user

In order of preference:

1. `page.getByRole('link', { name: 'Contact', exact: true })` and other role + accessible name locators.
2. `page.getByTestId('contact-email')` when the role and name would be ambiguous or are content that is expected to change.
3. Never CSS classes, element structure or XPath.

If you need a test id, add `data-testid="kebab-case-name"` to the markup in `src/pages/` or `src/layouts/`, named after what the element is.

Put locators used by more than one test in a page object in `e2e/pages/`. `SitePage` covers the shared header, navigation and heading; `HomePage` covers the home page. Page objects expose locators and navigation, never assertions.

## 3. Write the test

```ts
import { expect, test } from '@playwright/test';
import { SitePage } from './pages/SitePage';

test.describe('Content', () => {
  test('projects links to the source code and the test plan', async ({ page }) => {
    await new SitePage(page).goto('projects');

    await expect(page.getByTestId('link-repo')).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins',
    );
  });
});
```

- Navigate with `SitePage.goto(path)` or a relative URL (`'./about/'`). Never an absolute URL or a hardcoded host: the same test must pass with `BASE_URL` pointing at the live site.
- Use web-first assertions that retry: `await expect(locator).toHaveText(...)`, `toHaveAttribute`, `toBeVisible`, `toHaveCount`. Avoid `expect(await locator.textContent())`.
- No `page.waitForTimeout`. Wait for an event (`page.waitForEvent('download')`) or an assertion instead.
- For downloads, check the file name, status, content type and the first bytes (see the CV test in `content.spec.ts`).
- Loop over `sitePages` when a rule applies to every page, so new pages are covered automatically.
- One behaviour per test, Arrange / Act / Assert separated by a blank line.

## 4. Run it

```sh
npm run build
npm run test:e2e -- --project=chromium e2e/content.spec.ts
```

Then run all three projects if your environment has the browsers; CI runs each in its own job. A test must fail when the behaviour breaks: temporarily break the markup (or the assertion) and confirm you see a clear failure, then revert.

## 5. Before you finish

- `npm run lint`, `npm run format:check` and `npm run check` pass.
- No `test.only`, `test.skip` or `test.fixme` left behind (`forbidOnly` fails CI on `.only`).
- If the test covers a new risk, add it to `docs/test-plan.md`.
