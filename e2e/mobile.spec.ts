import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { AboutPage } from './pages/AboutPage';
import { PostPage, postLabel, postPages } from './pages/PostPage';
import { pageLabel, pagesIn, SitePage, sitePages } from './pages/SitePage';

// Runs only in the phone projects (see playwright.config.ts), with their touch screen and viewport.

test.describe('Mobile', () => {
  for (const sitePage of sitePages) {
    test(`${pageLabel(sitePage)} page fits the phone screen without scrolling sideways`, async ({
      page,
    }) => {
      const site = new SitePage(page, sitePage.lang);
      await site.goto(sitePage.path);

      expect(await site.horizontalOverflow()).toBe(0);
    });
  }

  // WCAG 1.4.10 Reflow: content works at 320 CSS pixels wide, the narrowest phones in use.
  test.describe('at 320 pixels wide', () => {
    test.use({ viewport: { width: 320, height: 640 } });

    for (const sitePage of sitePages) {
      test(`${pageLabel(sitePage)} page reflows without scrolling sideways`, async ({ page }) => {
        const site = new SitePage(page, sitePage.lang);
        await site.goto(sitePage.path);

        expect(await site.horizontalOverflow()).toBe(0);
      });
    }

    for (const post of postPages) {
      test(`${postLabel(post)} reflows without scrolling sideways`, async ({ page }) => {
        const postPage = new PostPage(page, post);
        await postPage.goto();

        expect(await postPage.horizontalOverflow()).toBe(0);
      });
    }
  });

  for (const sitePage of sitePages) {
    // WCAG 2.2 2.5.8 Target Size: controls are at least 24 by 24 pixels, or spaced apart.
    test(`${pageLabel(sitePage)} page has controls large enough to tap`, async ({ page }) => {
      await new SitePage(page, sitePage.lang).goto(sitePage.path);

      const results = await new AxeBuilder({ page }).withRules(['target-size']).analyze();

      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }

  for (const lang of ['en', 'pt'] as const) {
    test(`every menu link can be tapped to reach its page (${lang})`, async ({ page }) => {
      const site = new SitePage(page, lang);
      await site.goto('');

      for (const { name, heading } of pagesIn(lang)) {
        await site.header.showNav();
        await expect(site.header.navLink(name)).toBeInViewport();
        await site.header.navLink(name).tap();
        await expect(site.heading).toHaveText(heading);
      }
    });
  }

  test('the theme menu opens below the button, inside the screen', async ({ page }) => {
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');

    await themeMenu.button.tap();
    await expect(themeMenu.menu).toBeInViewport({ ratio: 1 });

    const button = await themeMenu.button.boundingBox();
    const menu = await themeMenu.menu.boundingBox();
    expect(menu!.y).toBeGreaterThanOrEqual(button!.y + button!.height);
    expect(menu!.x).toBeGreaterThanOrEqual(0);
  });

  test('a theme can be chosen by tapping, and the menu closes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');

    await themeMenu.button.tap();
    await themeMenu.option('Dark').tap();

    await expect(themeMenu.menu).toBeHidden();
    await expect(site.root).toHaveAttribute('data-theme', 'dark');
  });

  test('the language menu opens below the button, inside the screen, and a tap switches language', async ({
    page,
  }) => {
    const about = new AboutPage(page);
    const { languageMenu } = about.header;
    await about.goto();

    await languageMenu.button.tap();
    await expect(languageMenu.menu).toBeInViewport({ ratio: 1 });
    const button = await languageMenu.button.boundingBox();
    const menu = await languageMenu.menu.boundingBox();
    expect(menu!.y).toBeGreaterThanOrEqual(button!.y + button!.height);

    await languageMenu.option('pt').tap();
    await expect(about.heading).toHaveText('Sobre');
  });

  test('tapping outside the language menu closes it', async ({ page }) => {
    const site = new SitePage(page);
    const { languageMenu } = site.header;
    await site.goto('');
    await languageMenu.button.tap();

    await site.heading.tap();

    await expect(languageMenu.menu).toBeHidden();
  });

  test('tapping outside the theme menu closes it', async ({ page }) => {
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');
    await themeMenu.button.tap();

    await site.heading.tap();

    await expect(themeMenu.menu).toBeHidden();
  });
});
