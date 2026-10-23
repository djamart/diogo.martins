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

test.describe('Theme toggle', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`starts in the ${colorScheme} theme when the system prefers it`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme });
      const site = new SitePage(await context.newPage());

      await site.goto('');

      await expect(site.themeToggle).toHaveAttribute(
        'aria-pressed',
        String(colorScheme === 'dark'),
      );
      await expect(site.body).toHaveCSS('background-color', background[colorScheme]);
      await context.close();
    });
  }

  test('switches between light and dark on click', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');

    await site.themeToggle.click();
    await expect(site.themeToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(site.body).toHaveCSS('background-color', background.dark);

    await site.themeToggle.click();
    await expect(site.themeToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(site.body).toHaveCSS('background-color', background.light);
  });

  test('remembers the choice on other pages and after a reload', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');

    await site.themeToggle.click();
    await site.navLink('About').click();
    await expect(site.heading).toHaveText('About');

    await expect(site.themeToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(site.body).toHaveCSS('background-color', background.dark);
    await page.reload();
    await expect(site.body).toHaveCSS('background-color', background.dark);
  });

  test('a chosen theme wins over the system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const site = new SitePage(page);
    await site.goto('');

    await site.themeToggle.click();
    await page.reload();

    await expect(site.themeToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(site.body).toHaveCSS('background-color', background.light);
  });

  test('can be used with the keyboard', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');

    await site.themeToggle.focus();
    await page.keyboard.press('Enter');
    await expect(site.themeToggle).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Space');

    await expect(site.themeToggle).toHaveAttribute('aria-pressed', 'false');
  });
});
