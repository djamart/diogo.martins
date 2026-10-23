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

      await site.goto('');
      await site.themeButton.click();

      await expect(site.themeOption('System')).toHaveAttribute('aria-checked', 'true');
      await expect(site.body).toHaveCSS('background-color', background[colorScheme]);
    });
  }

  test('opens from one button and closes after a choice', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');
    await expect(site.themeMenu).toBeHidden();

    await site.themeButton.click();
    await expect(site.themeButton).toHaveAttribute('aria-expanded', 'true');
    await expect(site.themeMenu).toBeVisible();
    await site.themeOption('Dark').click();

    await expect(site.themeMenu).toBeHidden();
    await expect(site.themeButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('light and dark override the system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const site = new SitePage(page);
    await site.goto('');

    await site.chooseTheme('Light');
    await expect(site.body).toHaveCSS('background-color', background.light);

    await page.emulateMedia({ colorScheme: 'light' });
    await site.chooseTheme('Dark');
    await expect(site.body).toHaveCSS('background-color', background.dark);
  });

  test('system goes back to following the system preference, live', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');
    await site.chooseTheme('Dark');

    await site.chooseTheme('System');
    await expect(site.body).toHaveCSS('background-color', background.light);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(site.body).toHaveCSS('background-color', background.dark);

    await page.reload();
    await site.themeButton.click();
    await expect(site.themeOption('System')).toHaveAttribute('aria-checked', 'true');
  });

  test('remembers the choice on other pages and after a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');

    await site.chooseTheme('Dark');
    await site.navLink('About').click();
    await expect(site.heading).toHaveText('About');

    await expect(site.body).toHaveCSS('background-color', background.dark);
    await page.reload();
    await expect(site.body).toHaveCSS('background-color', background.dark);
    await site.themeButton.click();
    await expect(site.themeOption('Dark')).toHaveAttribute('aria-checked', 'true');
  });

  test('can be used with the keyboard', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');

    await site.themeButton.focus();
    await page.keyboard.press('Enter');
    await expect(site.themeOption('System')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(site.themeOption('Dark')).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(site.body).toHaveCSS('background-color', background.dark);
    await expect(site.themeMenu).toBeHidden();
    await expect(site.themeButton).toBeFocused();
  });

  test('Escape closes the menu and returns focus to the button', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');
    await site.themeButton.focus();
    await page.keyboard.press('ArrowDown');
    await expect(site.themeOption('Light')).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(site.themeMenu).toBeHidden();
    await expect(site.themeButton).toBeFocused();
  });

  test('clicking elsewhere closes the menu without changing the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');
    await site.themeButton.click();

    await site.heading.click();

    await expect(site.themeMenu).toBeHidden();
    await expect(site.body).toHaveCSS('background-color', background.light);
  });
});
