---
name: write-e2e-test
description: Add or change Playwright end-to-end tests for a page, a visitor flow, a link or a download on this site. Use when a change affects what a visitor sees or does in the browser.
---

# Write an E2E test

End-to-end tests prove the site works for a visitor, in Chromium, Firefox and WebKit and on phones (Pixel 7, iPhone 15), against the production build and the live site. They are the slowest level, so they cover behaviour that only a browser can show. Logic that can be checked without a browser belongs in a unit test (see `write-unit-test`).

## 1. Decide what to prove

Write the behaviour as one sentence from the visitor's point of view before writing code, e.g. "the contact page offers email, LinkedIn and GitHub, and no phone number". If the change came from a user story, each acceptance scenario usually becomes one test.

Check the existing specs first; extend a test rather than adding a near-duplicate.

| Spec                    | Covers                                                          |
| ----------------------- | --------------------------------------------------------------- |
| `smoke.spec.ts`         | The few checks that must pass on the live site after a deploy   |
| `navigation.spec.ts`    | Every page loads, menu, skip link, calls to action              |
| `content.spec.ts`       | Content promises: role, experience order, contacts, CV download |
| `accessibility.spec.ts` | axe on every page in `sitePages`, light and dark themes         |
| `theme.spec.ts`         | Theme menu: system default, light/dark/system, keyboard         |
| `mobile.spec.ts`        | Phones only: reflow at 320 px, tap target size, touch           |
| `language.spec.ts`      | Language switch, `lang` and `hreflang`, Portuguese content      |
| `blog.spec.ts`          | Blog index, RSS feed, and every post in `postPages`             |
| `visual.spec.ts`        | Screenshots of every English page, light and dark               |

Only add to `smoke.spec.ts` if a failure would mean the live site is broken for everyone. A new concern that does not fit these gets its own `<concern>.spec.ts`.

## 2. Find or extend the page object

The suite follows the Page Object Model: specs say what the visitor does and what they should see; page objects in `e2e/pages/` know where things are on the page.

| Page object               | Covers                                                                 |
| ------------------------- | ---------------------------------------------------------------------- |
| `SitePage`                | Any page: `root` (`<html>`), `heading`, `header`, `footer`, `head`     |
| `HomePage`, `AboutPage`,  | One page each, extending `SitePage` with that page's content, and a    |
| `ContactPage`,            | `path` so `goto()` needs no argument                                   |
| `QualityPage`             |                                                                        |
| `BlogPage`, `PostPage`    | The blog index of one language, and one post from `postPages`          |
| `NotFoundPage`            | The 404 page                                                           |
| `components/Header`       | Skip link, `navLink(name)`, and the `themeMenu` and `languageMenu`     |
| `components/ThemeMenu`    | `button`, `menu`, `option('Dark')`, `choose('Dark')`, `rememberChoice` |
| `components/LanguageMenu` | `button`, `menu`, `option('pt')`, `choose('pt')`                       |
| `components/Footer`       | Contact region, email, LinkedIn, CV and source code links              |
| `components/PageHead`     | `<link>` elements in the head: icon, feed, `alternate(hreflang)`       |

Rules:

- A spec never calls `page.getByRole`, `page.getByTestId` or `page.locator`. If the element you need has no locator yet, add it to the page object of the page it is on, or to a component if every page has it. `page` in a spec is only for the browser itself: `page.keyboard`, `page.emulateMedia`, `page.setViewportSize`, `expect(page).toHaveURL(...)` and `toHaveScreenshot`.
- Page objects expose locators (as `readonly` fields, or a method when they take an argument) and actions (`goto`, `choose`, `downloadCv`). They never assert; the spec decides what is right.
- A new page gets its own class that extends `SitePage` and overrides `path`. Build it with the page's language (`new AboutPage(page, 'pt')`): its locators use that language's accessible names from `src/i18n/ui.ts`.
- A spec builds page objects, never components: reach them through the page (`const { themeMenu } = site.header`).
- Inside a page object, locate elements like a user, in this order of preference:
  1. `page.getByRole('link', { name: 'Contact', exact: true })` and other role + accessible name locators.
  2. `page.getByTestId('contact-email')` when the role and name would be ambiguous or are content that is expected to change.
  3. A CSS selector only for elements with no role that machines read (`<link>` in the head, `<time>`), with a comment saying why. Never CSS classes for layout, element structure or XPath.

If you need a test id, add `data-testid="kebab-case-name"` to the markup in `src/pages/` or `src/layouts/`, named after what the element is.

## 3. Write the test

```ts
import { expect, test } from '@playwright/test';
import { QualityPage } from './pages/QualityPage';

test.describe('Content', () => {
  test('quality links to the CI history', async ({ page }) => {
    const quality = new QualityPage(page);
    await quality.goto();

    await expect(quality.ciHistoryLink).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins/actions/workflows/ci.yml',
    );
  });
});
```

- Navigate with a page object's `goto()`. It uses relative URLs, never an absolute URL or a hardcoded host: the same test must pass with `BASE_URL` pointing at the live site.
- Use web-first assertions that retry: `await expect(locator).toHaveText(...)`, `toHaveAttribute`, `toBeVisible`, `toHaveCount`. Avoid `expect(await locator.textContent())`.
- No `page.waitForTimeout`. Wait for an event or an assertion instead; an action that waits for one (like `ContactPage.downloadCv`) belongs in the page object.
- For downloads, check the file name, status, content type and the first bytes (see the CV test in `content.spec.ts`).
- Loop over `sitePages` when a rule applies to every page, so new pages are covered automatically in both languages: `new SitePage(page, info.lang).goto(info.path)`. Loop over `postPages` for every blog post: `new PostPage(page, post).goto()`.
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
