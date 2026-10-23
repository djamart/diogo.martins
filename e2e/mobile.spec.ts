import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { SitePage, sitePages } from './pages/SitePage';

// Runs only in the phone projects (see playwright.config.ts), with their touch screen and viewport.

/** How far the page can be scrolled sideways; anything above zero means content is cut off. */
async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
}

test.describe('Mobile', () => {
  for (const { path, name } of sitePages) {
    test(`${name} page fits the phone screen without scrolling sideways`, async ({ page }) => {
      await new SitePage(page).goto(path);

      expect(await horizontalOverflow(page)).toBe(0);
    });
  }

  // WCAG 1.4.10 Reflow: content works at 320 CSS pixels wide, the narrowest phones in use.
  test.describe('at 320 pixels wide', () => {
    test.use({ viewport: { width: 320, height: 640 } });

    for (const { path, name } of sitePages) {
      test(`${name} page reflows without scrolling sideways`, async ({ page }) => {
        await new SitePage(page).goto(path);

        expect(await horizontalOverflow(page)).toBe(0);
      });
    }
  });

  for (const { path, name } of sitePages) {
    // WCAG 2.2 2.5.8 Target Size: controls are at least 24 by 24 pixels, or spaced apart.
    test(`${name} page has controls large enough to tap`, async ({ page }) => {
      await new SitePage(page).goto(path);

      const results = await new AxeBuilder({ page }).withRules(['target-size']).analyze();

      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }

  test('every menu link can be tapped to reach its page', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');

    for (const { name, heading } of sitePages) {
      await expect(site.navLink(name)).toBeInViewport();
      await site.navLink(name).tap();
      await expect(site.heading).toHaveText(heading);
    }
  });

  test('the theme menu opens below the button, inside the screen', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');

    await site.themeButton.tap();
    await expect(site.themeMenu).toBeInViewport({ ratio: 1 });

    const button = await site.themeButton.boundingBox();
    const menu = await site.themeMenu.boundingBox();
    expect(menu!.y).toBeGreaterThanOrEqual(button!.y + button!.height);
    expect(menu!.x).toBeGreaterThanOrEqual(0);
  });

  test('a theme can be chosen by tapping, and the menu closes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');

    await site.themeButton.tap();
    await site.themeOption('Dark').tap();

    await expect(site.themeMenu).toBeHidden();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('tapping outside the theme menu closes it', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');
    await site.themeButton.tap();

    await site.heading.tap();

    await expect(site.themeMenu).toBeHidden();
  });
});
