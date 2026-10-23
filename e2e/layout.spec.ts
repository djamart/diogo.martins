import { expect, test } from '@playwright/test';
import { pageLabel, SitePage, sitePages } from './pages/SitePage';

// Headless Chromium hides scrollbars by default, which would hide a layout that moves when the
// scrollbar comes and goes. A tall window makes the short pages fit without one.
test.use({
  launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] },
  viewport: { width: 1280, height: 1080 },
});

test.describe('Layout', () => {
  for (const sitePage of sitePages) {
    const { lang, path } = sitePage;
    test(`${pageLabel(sitePage)} page keeps the menu in the same place as a long page`, async ({
      page,
    }) => {
      const site = new SitePage(page, lang);
      await site.goto('about');
      await site.fontsLoaded();
      const expected = await site.navLeftEdge();

      await site.goto(path);
      await site.fontsLoaded();

      expect(await site.navLeftEdge()).toBe(expected);
    });
  }
});
