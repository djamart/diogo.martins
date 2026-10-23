import { expect, test } from '@playwright/test';
import { pageLabel, pagesIn, SitePage, sitePages } from './pages/SitePage';
import { HomePage } from './pages/HomePage';

test.describe('Navigation', () => {
  for (const sitePage of sitePages) {
    const { lang, path, name, heading } = sitePage;
    test(`${pageLabel(sitePage)} page loads and is marked as current in the menu`, async ({
      page,
    }) => {
      const site = new SitePage(page, lang);
      const response = await site.goto(path);

      expect(response?.status()).toBe(200);
      await expect(site.heading).toHaveText(heading);
      await expect(site.navLink(name)).toHaveAttribute('aria-current', 'page');
      await expect(site.nav.locator('[aria-current="page"]')).toHaveCount(1);
    });
  }

  for (const lang of ['en', 'pt'] as const) {
    test(`every menu link reaches its page (${lang})`, async ({ page }) => {
      const site = new SitePage(page, lang);
      await site.goto('');

      for (const { name, heading } of pagesIn(lang)) {
        await site.navLink(name).click();
        await expect(site.heading).toHaveText(heading);
      }
    });
  }

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

  test('home call-to-action buttons lead to contact and the experience on about', async ({
    page,
  }) => {
    const home = new HomePage(page);
    const site = new SitePage(page);

    await home.goto();
    await home.contactCta.click();
    await expect(site.heading).toHaveText('Contact');

    await home.goto();
    await home.experienceCta.click();
    await expect(site.heading).toHaveText('About');
    await expect(page).toHaveURL(/\/about\/#experience$/);
    await expect(page.getByRole('heading', { name: 'Experience', level: 2 })).toBeInViewport();
  });
});
