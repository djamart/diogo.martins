import { expect, test } from '@playwright/test';
import { pageLabel, pagesIn, SitePage } from './pages/SitePage';

// Runs only in the chromium and mobile-chrome projects, against the build (see playwright.config.ts).
// The baselines come from the Playwright Docker image CI uses: `npm run test:visual:update`.
// Portuguese pages share the layout, so English is enough; their reflow is checked in mobile.spec.ts.
for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`Visual (${colorScheme} theme)`, () => {
    test.use({ colorScheme });

    for (const sitePage of pagesIn('en')) {
      test(`${pageLabel(sitePage)} page looks the same as its approved screenshot`, async ({
        page,
      }) => {
        await new SitePage(page).goto(sitePage.path);
        // Text set in a fallback font would shift every line, so wait for the web fonts.
        await page.evaluate(() => document.fonts.ready);

        await expect(page).toHaveScreenshot(`${sitePage.path || 'home'}-${colorScheme}.png`, {
          fullPage: true,
        });
      });
    }
  });
}
