import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { loadSkills } from '../src/quality/skills';
import { ui } from '../src/i18n/ui';
import { SitePage, pageLabel, sitePages } from './pages/SitePage';
import { HomePage } from './pages/HomePage';

test.describe('Content', () => {
  test('home page shows the role and the three focus areas', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.role).toHaveText('Quality Enablement Engineer');
    await expect(home.headline).toHaveText(ui.en['home.headline']);
    await expect(home.pillars).toHaveText([
      'Test automation',
      'Quality engineering',
      'AI-driven testing',
    ]);
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

  test('every page ends with a way to get in touch', async ({ page }) => {
    for (const info of sitePages) {
      const site = new SitePage(page, info.lang);
      await site.goto(info.path);

      await expect(site.footerContact, pageLabel(info)).toBeVisible();
      await expect(page.getByTestId('footer-email')).toHaveAttribute('href', /^mailto:/);
      await expect(page.getByTestId('footer-linkedin')).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/diogojamartins/',
      );
      await expect(page.getByTestId('footer-cv')).toHaveAttribute(
        'href',
        /\/diogo-martins-cv\.pdf$/,
      );
      await expect(page.getByTestId('footer-cv')).toHaveAttribute('download');
    }
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

  test('home features this website with its checks, source code and test plan', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.project.getByRole('heading')).toHaveText('This website');
    await home.project.getByTestId('link-quality').click();
    await expect(new SitePage(page).heading).toHaveText('Quality');

    await home.goto();
    await expect(home.project.getByTestId('link-repo')).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins',
    );
    await expect(home.project.getByTestId('link-test-plan')).toHaveAttribute(
      'href',
      /test-plan\.md$/,
    );
  });

  test('the old projects address leads to the featured project on the home page', async ({
    page,
  }) => {
    for (const [from, to] of [
      ['./projects/', /\/diogo\.martins\/#project$/],
      ['./pt/projects/', /\/diogo\.martins\/pt\/#project$/],
    ] as const) {
      await page.goto(from);
      await expect(page).toHaveURL(to);
      await expect(new HomePage(page).project).toBeVisible();
    }
  });

  test('quality lists the gates every change passes, in the order they run', async ({ page }) => {
    await new SitePage(page).goto('quality');

    await expect(page.getByTestId('gates-pull-request').getByTestId('gate')).toContainText([
      'Static analysis',
      'Unit tests',
      'End-to-end tests',
      'Accessibility',
      'Phone screens',
      'Performance and SEO',
      'Broken links',
    ]);
    await expect(page.getByTestId('gates-deploy').getByTestId('gate')).toContainText([
      'Deploy from a green build only',
      'Live smoke test',
    ]);
  });

  test('quality shows the results of the build, or says why there are none', async ({ page }) => {
    await new SitePage(page).goto('quality');

    await expect(
      page.getByTestId('results').or(page.getByTestId('results-unavailable')),
    ).toBeVisible();
    await expect(page.getByTestId('link-ci-history')).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins/actions/workflows/ci.yml',
    );
  });

  test('quality links to CLAUDE.md and every AI skill in the repository', async ({ page }) => {
    await new SitePage(page).goto('quality');

    await expect(page.getByTestId('link-claude-md')).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins/blob/main/CLAUDE.md',
    );
    const skills = page.getByTestId('skills').getByRole('link');
    await expect(skills).toHaveCount(loadSkills(join(process.cwd(), '.claude', 'skills')).length);
    await expect(skills.first()).toHaveAttribute(
      'href',
      /\/\.claude\/skills\/add-page\/SKILL\.md$/,
    );
    await expect(page.getByTestId('link-quality-test-plan')).toHaveAttribute(
      'href',
      /test-plan\.md$/,
    );
  });
});
