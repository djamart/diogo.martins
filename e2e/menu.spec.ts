import { expect, test } from '@playwright/test';
import { AboutPage } from './pages/AboutPage';
import { navFoldWidth } from '../src/utils/nav';
import { pagesIn, SitePage } from './pages/SitePage';

const wide = { width: 1280, height: 800 };
const narrow = { width: 360, height: 740 };

test.describe('Menu button', () => {
  test('a wide window shows the menu links in the header, with no menu button', async ({
    page,
  }) => {
    await page.setViewportSize(wide);
    const site = new SitePage(page);
    await site.goto('');

    await expect(site.header.nav).toBeVisible();
    await expect(site.header.menuButton).toBeHidden();
  });

  test('a narrow window folds the menu links into a menu button', async ({ page }) => {
    await page.setViewportSize(narrow);
    const site = new SitePage(page);
    await site.goto('');

    await expect(site.header.menuButton).toBeVisible();
    await expect(site.header.nav).toBeHidden();
  });

  test('resizing the window folds and unfolds the links', async ({ page }) => {
    await page.setViewportSize(wide);
    const site = new SitePage(page);
    await site.goto('');
    await expect(site.header.menuButton).toBeHidden();

    await page.setViewportSize(narrow);
    await expect(site.header.menuButton).toBeVisible();

    await page.setViewportSize(wide);
    await expect(site.header.menuButton).toBeHidden();
    await expect(site.header.nav).toBeVisible();
  });

  for (const lang of ['en', 'pt'] as const) {
    test(`the links fit on one line at the narrowest window that shows them (${lang})`, async ({
      page,
    }) => {
      const site = new SitePage(page, lang);
      await page.setViewportSize({ width: navFoldWidth[lang], height: 740 });
      await site.goto('');
      await site.fontsLoaded();

      await expect(site.header.menuButton).toBeHidden();
      expect(await site.header.navRowCount()).toBe(1);

      await page.setViewportSize({ width: navFoldWidth[lang] - 1, height: 740 });
      await expect(site.header.menuButton).toBeVisible();
    });

    test(`opens a panel from the left with every page, marking the current one (${lang})`, async ({
      page,
    }) => {
      await page.setViewportSize(narrow);
      const about = new AboutPage(page, lang);
      const { header } = about;
      await about.goto();

      await header.menuButton.click();

      await expect(header.menuPanel).toBeVisible();
      await expect(header.menuButton).toHaveAttribute('aria-expanded', 'true');
      // It slides in, so it reaches the left edge once the movement ends.
      await expect.poll(async () => (await header.menuPanel.boundingBox())?.x).toBe(0);
      for (const { name } of pagesIn(lang)) {
        await expect(header.navLink(name)).toBeInViewport();
      }
      await expect(header.navLink(pagesIn(lang)[1].name)).toHaveAttribute('aria-current', 'page');
      await expect(header.currentLinks).toHaveCount(1);
    });
  }

  test('the close button closes the panel and gives focus back to the menu button', async ({
    page,
  }) => {
    await page.setViewportSize(narrow);
    const site = new SitePage(page);
    await site.goto('');
    await site.header.menuButton.click();

    await site.header.menuCloseButton.click();

    await expect(site.header.menuPanel).toBeHidden();
    await expect(site.header.menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(site.header.menuButton).toBeFocused();
  });

  test('a click beside the panel closes it', async ({ page }) => {
    await page.setViewportSize(narrow);
    const site = new SitePage(page);
    await site.goto('');
    await site.header.menuButton.click();
    await expect(site.header.menuPanel).toBeVisible();

    await site.header.closeMenuFromOutside();

    await expect(site.header.menuPanel).toBeHidden();
  });

  test('can be used with the keyboard', async ({ page }) => {
    await page.setViewportSize(narrow);
    const site = new SitePage(page);
    await site.goto('');

    await site.header.menuButton.focus();
    await page.keyboard.press('Enter');
    await expect(site.header.menuPanel).toBeVisible();
    await expect(site.header.menuCloseButton).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(site.header.navLink('Home')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(site.header.menuPanel).toBeHidden();
    await expect(site.header.menuButton).toBeFocused();
  });

  test('widening the window closes an open panel and shows the links in the header', async ({
    page,
  }) => {
    await page.setViewportSize(narrow);
    const site = new SitePage(page);
    await site.goto('');
    await site.header.menuButton.click();

    await page.setViewportSize(wide);

    await expect(site.header.menuPanel).toBeHidden();
    await expect(site.header.nav).toBeVisible();
  });
});
