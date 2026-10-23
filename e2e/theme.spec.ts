import { expect, test } from '@playwright/test';
import { palette } from '../src/styles/tokens';
import { SitePage } from './pages/SitePage';

/** The page background as the browser reports it, so tests check what the visitor sees. */
const background = {
  light: hexToRgb(palette.papayaWhip),
  dark: hexToRgb(palette.graphite),
};

function hexToRgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

test.describe('Theme menu', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`follows the system by default, here ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      const site = new SitePage(page);
      const { themeMenu } = site.header;

      await site.goto('');
      await themeMenu.button.click();

      await expect(themeMenu.option('System')).toHaveAttribute('aria-checked', 'true');
      await expect(site.body).toHaveCSS('background-color', background[colorScheme]);
    });
  }

  test('opens from one button and closes after a choice', async ({ page }) => {
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');
    await expect(themeMenu.menu).toBeHidden();

    await themeMenu.button.click();
    await expect(themeMenu.button).toHaveAttribute('aria-expanded', 'true');
    await expect(themeMenu.menu).toBeVisible();
    await themeMenu.option('Dark').click();

    await expect(themeMenu.menu).toBeHidden();
    await expect(themeMenu.button).toHaveAttribute('aria-expanded', 'false');
  });

  test('on a wide screen, the menu opens to the right of the button, clear of the text', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');

    await themeMenu.button.click();
    await expect(themeMenu.menu).toBeVisible();

    const button = await themeMenu.button.boundingBox();
    const menu = await themeMenu.menu.boundingBox();
    expect(menu!.x).toBeGreaterThanOrEqual(button!.x + button!.width);
    expect(menu!.x + menu!.width).toBeLessThanOrEqual(1280);
  });

  test('light and dark override the system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');

    await themeMenu.choose('Light');
    await expect(site.body).toHaveCSS('background-color', background.light);

    await page.emulateMedia({ colorScheme: 'light' });
    await themeMenu.choose('Dark');
    await expect(site.body).toHaveCSS('background-color', background.dark);
  });

  test('system goes back to following the system preference, live', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');
    await themeMenu.choose('Dark');

    await themeMenu.choose('System');
    await expect(site.body).toHaveCSS('background-color', background.light);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(site.body).toHaveCSS('background-color', background.dark);

    await page.reload();
    await themeMenu.button.click();
    await expect(themeMenu.option('System')).toHaveAttribute('aria-checked', 'true');
  });

  test('remembers the choice on other pages and after a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');

    await themeMenu.choose('Dark');
    await site.header.navLink('About').click();
    await expect(site.heading).toHaveText('About');

    await expect(site.body).toHaveCSS('background-color', background.dark);
    await page.reload();
    await expect(site.body).toHaveCSS('background-color', background.dark);
    await themeMenu.button.click();
    await expect(themeMenu.option('Dark')).toHaveAttribute('aria-checked', 'true');
  });

  test('can be used with the keyboard', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');

    await themeMenu.button.focus();
    await page.keyboard.press('Enter');
    await expect(themeMenu.option('System')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(themeMenu.option('Dark')).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(site.body).toHaveCSS('background-color', background.dark);
    await expect(themeMenu.menu).toBeHidden();
    await expect(themeMenu.button).toBeFocused();
  });

  test('Escape closes the menu and returns focus to the button', async ({ page }) => {
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');
    await themeMenu.button.focus();
    await page.keyboard.press('ArrowDown');
    await expect(themeMenu.option('Light')).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(themeMenu.menu).toBeHidden();
    await expect(themeMenu.button).toBeFocused();
  });

  test('clicking elsewhere closes the menu without changing the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    const { themeMenu } = site.header;
    await site.goto('');
    await themeMenu.button.click();

    await site.heading.click();

    await expect(themeMenu.menu).toBeHidden();
    await expect(site.body).toHaveCSS('background-color', background.light);
  });

  test('keeps the page where it was after a choice', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('about');
    await site.scrollDown();
    const position = await site.scrollPosition();

    await site.header.themeMenu.choose('Dark');

    await expect(site.root).toHaveAttribute('data-theme', 'dark');
    expect(await site.scrollPosition()).toBe(position);
  });
});
