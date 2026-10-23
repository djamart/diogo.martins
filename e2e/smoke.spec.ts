import { expect, test } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ui } from '../src/i18n/ui';
import { parseHistory } from '../src/quality/history';

test.describe('Smoke', () => {
  test('home page loads with the main heading', async ({ page }) => {
    const home = new HomePage(page);
    const response = await home.goto();

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Diogo Martins/);
    await expect(home.heading).toContainText('Diogo Martins');
  });

  test('home page declares English as its language', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.root).toHaveAttribute('lang', 'en');
  });

  test('Portuguese home page loads and declares European Portuguese', async ({ page }) => {
    const home = new HomePage(page, 'pt');
    const response = await home.goto();

    expect(response?.status()).toBe(200);
    await expect(home.root).toHaveAttribute('lang', 'pt-PT');
    await expect(home.heading).toContainText('Diogo Martins');
  });

  test('home page icon loads', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    const href = await home.head.icon.getAttribute('href');

    const response = await page.request.get(new URL(href ?? '', page.url()).href);
    expect(response.status()).toBe(200);
  });

  test('footer links to the source code', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.footer.sourceLink).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins',
    );
  });

  // The next deploy downloads this file to add itself to the trend on /quality.
  test('publishes the deploy history in a form the next deploy can read', async ({ request }) => {
    const response = await request.get('./quality-history.json');

    expect(response.status()).toBe(200);
    const json: unknown = await response.json();
    expect(() => parseHistory(json)).not.toThrow();
  });

  test('unknown page shows the 404 page with a way back home', async ({ page }) => {
    const notFound = new NotFoundPage(page);
    const response = await notFound.goto();

    expect(response?.status()).toBe(404);
    await expect(notFound.heading).toHaveText(ui.en['notFound.heading']);
    await notFound.homeLink.click();
    await expect(new HomePage(page).heading).toContainText('Diogo Martins');
  });
});
