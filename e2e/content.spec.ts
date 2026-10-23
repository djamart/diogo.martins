import { expect, test } from '@playwright/test';
import { SitePage } from './pages/SitePage';
import { HomePage } from './pages/HomePage';

test.describe('Content', () => {
  test('home page shows the role and the three focus areas', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.role).toHaveText('Quality Enablement Engineer');
    await expect(page.getByTestId('pillars')).toHaveText(
      'Test automation · Quality engineering · AI-driven testing',
    );
  });

  test('experience lists roles from the most recent', async ({ page }) => {
    await new SitePage(page).goto('experience');
    const roles = page.getByTestId('role');

    await expect(roles).toHaveCount(3);
    await expect(roles.first()).toContainText('Capital on Tap');
    await expect(roles.first()).toContainText('present');
  });

  test('about lists certifications and has no education section', async ({ page }) => {
    await new SitePage(page).goto('about');

    await expect(page.getByTestId('certifications').getByRole('listitem')).not.toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Education' })).toHaveCount(0);
  });

  test('contact offers email, LinkedIn and GitHub, and no phone number', async ({ page }) => {
    await new SitePage(page).goto('contact');

    await expect(page.getByTestId('contact-email')).toHaveAttribute('href', /^mailto:/);
    await expect(page.getByTestId('contact-linkedin')).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/diogojamartins/',
    );
    await expect(page.getByTestId('contact-github')).toHaveAttribute(
      'href',
      'https://github.com/djamart',
    );
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  });

  test('home and contact link to the CV as a PDF download', async ({ page }) => {
    for (const [path, testId] of [
      ['', 'cta-cv'],
      ['contact', 'contact-cv'],
    ] as const) {
      await new SitePage(page).goto(path);
      const link = page.getByTestId(testId);

      await expect(link).toHaveAttribute('href', /\/diogo-martins-cv\.pdf$/);
      await expect(link).toHaveAttribute('download');
    }
  });

  test('the CV downloads as a PDF', async ({ page }) => {
    await new SitePage(page).goto('contact');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('contact-cv').click(),
    ]);

    expect(download.suggestedFilename()).toBe('diogo-martins-cv.pdf');
    const response = await page.request.get(download.url());
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    expect((await response.body()).subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  test('projects links to the source code and the test plan', async ({ page }) => {
    await new SitePage(page).goto('projects');

    await expect(page.getByTestId('link-repo')).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins',
    );
    await expect(page.getByTestId('link-test-plan')).toHaveAttribute('href', /test-plan\.md$/);
  });
});
