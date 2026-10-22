import { expect, test } from '@playwright/test';
import { HomePage } from './pages/HomePage';

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
