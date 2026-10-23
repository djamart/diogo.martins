import { expect, test } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { SitePage } from './pages/SitePage';

test.describe('Smoke', () => {
  test('home page loads with the main heading', async ({ page }) => {
    const home = new HomePage(page);
    const response = await home.goto();

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Diogo Martins/);
    await expect(home.heading).toContainText('Diogo Martins');
  });

  test('home page declares English as its language', async ({ page }) => {
    await new HomePage(page).goto();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('Portuguese home page loads and declares European Portuguese', async ({ page }) => {
    const response = await new SitePage(page, 'pt').goto('');

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT');
    await expect(new HomePage(page).heading).toContainText('Diogo Martins');
  });

  test('home page icon loads', async ({ page }) => {
    await new HomePage(page).goto();
    // A <link> in the head has no role; its href is all a browser uses.
    const href = await page.locator('link[rel="icon"]').getAttribute('href');

    const response = await page.request.get(new URL(href ?? '', page.url()).href);
    expect(response.status()).toBe(200);
  });

  test('footer links to the source code', async ({ page }) => {
    await new HomePage(page).goto();
    await expect(page.getByTestId('link-source')).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins',
    );
  });

  test('unknown page shows the 404 page with a way back home', async ({ page }) => {
    await page.goto('./this-page-does-not-exist');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await page.getByTestId('link-home').click();
    await expect(new HomePage(page).heading).toContainText('Diogo Martins');
  });
});
