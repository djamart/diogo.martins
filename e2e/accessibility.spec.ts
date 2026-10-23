import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { pageLabel, SitePage, sitePages } from './pages/SitePage';
import { themeStorageKey } from '../src/utils/theme';

// Phase 1 exit criterion: zero serious or critical axe violations on every page, in both themes.
for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`Accessibility (${colorScheme} theme)`, () => {
    test.use({ colorScheme });

    for (const sitePage of sitePages) {
      test(`${pageLabel(sitePage)} page has no serious accessibility violations`, async ({
        page,
      }) => {
        await new SitePage(page, sitePage.lang).goto(sitePage.path);

        await expectNoSeriousViolations(page);
      });
    }
  });
}

// Only controls take keyboard focus; tabindex on a heading or landmark confuses screen readers.
for (const sitePage of sitePages) {
  test(`${pageLabel(sitePage)} page puts tabindex only on interactive elements`, async ({
    page,
  }) => {
    await new SitePage(page, sitePage.lang).goto(sitePage.path);

    const nonInteractive = page.locator('[tabindex]:not(a, button, input, select, textarea)');

    await expect(nonInteractive).toHaveCount(0);
  });
}

// A theme picked in the theme menu goes through different CSS than the system preference.
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
    // With the menu open, so the scan covers it too.
    await site.themeButton.click();
    await expect(site.themeOption(chosen === 'dark' ? 'Dark' : 'Light')).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await expectNoSeriousViolations(page);
  });
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`open language menu has no serious accessibility violations (${colorScheme} theme)`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    const site = new SitePage(page, 'pt');
    await site.goto('');
    await site.languageButton.click();
    await expect(site.languageMenu).toBeVisible();

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
