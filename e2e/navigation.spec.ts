import { expect, test } from '@playwright/test';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { pageLabel, pagesIn, SitePage, sitePages } from './pages/SitePage';

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
      await site.header.showNav();
      await expect(site.header.navLink(name)).toHaveAttribute('aria-current', 'page');
      await expect(site.header.currentLinks).toHaveCount(1);
    });
  }

  for (const lang of ['en', 'pt'] as const) {
    test(`every menu link reaches its page (${lang})`, async ({ page }) => {
      const site = new SitePage(page, lang);
      await site.goto('');

      for (const { name, heading } of pagesIn(lang)) {
        await site.header.goToPage(name);
        await expect(site.heading).toHaveText(heading);
      }
    });
  }

  test('skip link jumps past the menu to the main content', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await page.keyboard.press('Tab');
    await expect(home.header.skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');

    await expect(home.contactCta).toBeFocused();
  });

  test('home call-to-action buttons lead to contact and the experience on about', async ({
    page,
  }) => {
    const home = new HomePage(page);
    const contact = new ContactPage(page);
    const about = new AboutPage(page);

    await home.goto();
    await home.contactCta.click();
    await expect(contact.heading).toHaveText('Contact');

    await home.goto();
    await home.experienceCta.click();
    await expect(about.heading).toHaveText('About');
    await expect(page).toHaveURL(/\/about\/#experience$/);
    await expect(about.experienceHeading).toBeInViewport();
  });

  test('moving to another page fades between the two where the browser can', async ({ page }) => {
    const site = new SitePage(page);
    await site.watchPageTransitions();
    await site.goto('');

    await site.header.goToPage('Blog');
    await expect(site.heading).toHaveText('Blog');

    const { supported, animated } = await site.pageTransition();
    expect(animated).toBe(supported);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('moving to another page shows it at once', async ({ page }) => {
      const site = new SitePage(page);
      await site.watchPageTransitions();
      await site.goto('');

      await site.header.goToPage('Blog');
      await expect(site.heading).toHaveText('Blog');

      expect((await site.pageTransition()).animated).toBe(false);
    });
  });
});
