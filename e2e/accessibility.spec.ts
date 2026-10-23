import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { SitePage, sitePages } from './pages/SitePage';
import { themeStorageKey } from '../src/utils/theme';

// Phase 1 exit criterion: zero serious or critical axe violations on every page, in both themes.
for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`Accessibility (${colorScheme} theme)`, () => {
    test.use({ colorScheme });

    for (const { path, name } of sitePages) {
      test(`${name} page has no serious accessibility violations`, async ({ page }) => {
        await new SitePage(page).goto(path);

        await expectNoSeriousViolations(page);
      });
    }
  });
}

// A theme picked with the toggle goes through different CSS than the system preference.
for (const [chosen, system] of [
  ['light', 'dark'],
  ['dark', 'light'],
] as const) {
  test(`${chosen} theme chosen over a ${system} system has no serious accessibility violations`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: system });
    await page.addInitScript(
      ([key, theme]) => localStorage.setItem(key, theme),
      [themeStorageKey, chosen],
    );
    const site = new SitePage(page);

    await site.goto('');
    await expect(site.themeToggle).toHaveAttribute('aria-pressed', String(chosen === 'dark'));

    await expectNoSeriousViolations(page);
  });
}

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}
