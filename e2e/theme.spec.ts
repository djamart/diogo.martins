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

test.describe('Theme picker', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`follows the system by default, here ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      const site = new SitePage(page);

      await site.goto('');

      await expect(site.themeOption('System')).toBeChecked();
      await expect(site.body).toHaveCSS('background-color', background[colorScheme]);
    });
  }

  test('light and dark override the system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const site = new SitePage(page);
    await site.goto('');

    await site.themeOption('Light').check();
    await expect(site.body).toHaveCSS('background-color', background.light);

    await page.emulateMedia({ colorScheme: 'light' });
    await site.themeOption('Dark').check();
    await expect(site.body).toHaveCSS('background-color', background.dark);
  });

  test('system goes back to following the system preference, live', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');
    await site.themeOption('Dark').check();

    await site.themeOption('System').check();
    await expect(site.body).toHaveCSS('background-color', background.light);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(site.body).toHaveCSS('background-color', background.dark);

    await page.reload();
    await expect(site.themeOption('System')).toBeChecked();
  });

  test('remembers the choice on other pages and after a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');

    await site.themeOption('Dark').check();
    await site.navLink('About').click();
    await expect(site.heading).toHaveText('About');

    await expect(site.themeOption('Dark')).toBeChecked();
    await expect(site.body).toHaveCSS('background-color', background.dark);
    await page.reload();
    await expect(site.themeOption('Dark')).toBeChecked();
    await expect(site.body).toHaveCSS('background-color', background.dark);
  });

  test('can be used with the keyboard', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');

    await site.themeOption('System').focus();
    await page.keyboard.press('ArrowLeft');

    await expect(site.themeOption('Dark')).toBeChecked();
    await expect(site.themeOption('Dark')).toBeFocused();
    await expect(site.body).toHaveCSS('background-color', background.dark);
  });
});
