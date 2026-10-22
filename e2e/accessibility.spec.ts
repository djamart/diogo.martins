import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SitePage, sitePages } from './pages/SitePage';

// Phase 1 exit criterion: zero serious or critical axe violations on every page, in both themes.
for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`Accessibility (${colorScheme} theme)`, () => {
    test.use({ colorScheme });

    for (const { path, name } of sitePages) {
      test(`${name} page has no serious accessibility violations`, async ({ page }) => {
        await new SitePage(page).goto(path);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        const serious = results.violations.filter(
          (violation) => violation.impact === 'serious' || violation.impact === 'critical',
        );

        expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
      });
    }
  });
}
