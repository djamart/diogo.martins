import { expect, test } from '@playwright/test';
import { SitePage, sitePages } from './pages/SitePage';
import { HomePage } from './pages/HomePage';

test.describe('Navigation', () => {
  for (const { path, name, heading } of sitePages) {
    test(`${name} page loads and is marked as current in the menu`, async ({ page }) => {
      const site = new SitePage(page);
      const response = await site.goto(path);

      expect(response?.status()).toBe(200);
      await expect(site.heading).toHaveText(heading);
      await expect(site.navLink(name)).toHaveAttribute('aria-current', 'page');
      await expect(site.nav.locator('[aria-current="page"]')).toHaveCount(1);
    });
  }

  test('every menu link reaches its page', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');

    for (const { name, heading } of sitePages) {
      await site.navLink(name).click();
      await expect(site.heading).toHaveText(heading);
    }
  });

  test('skip link jumps past the menu to the main content', async ({ page }) => {
    const site = new SitePage(page);
    const home = new HomePage(page);
    await home.goto();

    await page.keyboard.press('Tab');
    await expect(site.skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');

    await expect(home.contactCta).toBeFocused();
  });

  test('home call-to-action buttons lead to contact and experience', async ({ page }) => {
    const home = new HomePage(page);
    const site = new SitePage(page);

    await home.goto();
    await home.contactCta.click();
    await expect(site.heading).toHaveText('Contact');

    await home.goto();
    await home.experienceCta.click();
    await expect(site.heading).toHaveText('Experience');
  });
});
