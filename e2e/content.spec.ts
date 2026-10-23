import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { loadSkills } from '../src/quality/skills';
import { contactLinks } from '../src/data/profile';
import { ui } from '../src/i18n/ui';
import { allLanguages } from '../src/i18n/utils';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { QualityPage } from './pages/QualityPage';
import { SitePage, pageLabel, sitePages } from './pages/SitePage';

test.describe('Content', () => {
  test('home page shows the role and the three focus areas', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.role).toHaveText('Quality Assurance Engineer');
    await expect(home.headline).toHaveText(ui.en['home.headline']);
    await expect(home.pillars).toHaveText([
      'Test automation',
      'Quality engineering',
      'AI-driven testing',
    ]);
  });

  test('home page shows a photo of Diogo described in each language', async ({ page }) => {
    for (const lang of ['en', 'pt'] as const) {
      const home = new HomePage(page, lang);
      await home.goto();

      await expect(home.photo).toBeVisible();
      await expect(home.photo).toHaveAttribute('alt', ui[lang]['home.photoAlt']);
      // Loaded and decoded, not a broken image.
      await expect.poll(() => home.photoWidth()).toBeGreaterThan(0);
    }
  });

  test('about lists roles from the most recent', async ({ page }) => {
    const about = new AboutPage(page);
    await about.goto();

    await expect(about.roles).toHaveCount(3);
    await expect(about.roles.first()).toContainText('Capital on Tap');
    await expect(about.roles.first()).toContainText('present');
  });

  test('about lists certifications and has no education section', async ({ page }) => {
    const about = new AboutPage(page);
    await about.goto();

    await expect(about.certifications).not.toHaveCount(0);
    await expect(about.sectionHeading('Education')).toHaveCount(0);
  });

  test('contact offers email, LinkedIn and GitHub, and no phone number', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();

    await expect(contact.email).toHaveAttribute('href', /^mailto:/);
    await expect(contact.linkedin).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/diogojamartins/',
    );
    await expect(contact.github).toHaveAttribute('href', 'https://github.com/djamart');
    await expect(contact.phoneLinks).toHaveCount(0);
  });

  test('every page ends with a way to get in touch', async ({ page }) => {
    for (const info of sitePages) {
      const site = new SitePage(page, info.lang);
      const { footer } = site;
      await site.goto(info.path);

      await expect(footer.contact, pageLabel(info)).toBeVisible();
      await expect(footer.email).toHaveAttribute('href', /^mailto:/);
      await expect(footer.linkedin).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/diogojamartins/',
      );
      await expect(footer.github).toHaveAttribute('href', 'https://github.com/djamart');
      await expect(footer.cv).toHaveAttribute('href', /\/diogo-martins-cv\.pdf$/);
      await expect(footer.cv).toHaveAttribute('download');
    }
  });

  test('footer links are named by their text, not by their icons', async ({ page }) => {
    for (const lang of allLanguages) {
      const site = new SitePage(page, lang);
      const names = [...contactLinks.map((link) => link.label), ui[lang]['footer.cv']];
      await site.goto();

      await expect(site.footer.contactLinks).toHaveCount(names.length);
      for (const [index, name] of names.entries()) {
        await expect(site.footer.contactLinks.nth(index), lang).toHaveAccessibleName(name);
      }
    }
  });

  test('home and contact link to the CV as a PDF download', async ({ page }) => {
    const home = new HomePage(page);
    const contact = new ContactPage(page);

    for (const [pageObject, link] of [
      [home, home.cvCta],
      [contact, contact.cv],
    ] as const) {
      await pageObject.goto();

      await expect(link).toHaveAttribute('href', /\/diogo-martins-cv\.pdf$/);
      await expect(link).toHaveAttribute('download');
    }
  });

  test('the CV downloads as a PDF', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();

    const download = await contact.downloadCv();

    expect(download.suggestedFilename()).toBe('diogo-martins-cv.pdf');
    const response = await page.request.get(download.url());
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    expect((await response.body()).subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  test('the old experience address leads to the experience on the about page', async ({ page }) => {
    for (const [lang, to] of [
      ['en', /\/diogo\.martins\/about\/#experience$/],
      ['pt', /\/diogo\.martins\/pt\/about\/#experience$/],
    ] as const) {
      const about = new AboutPage(page, lang);
      await about.gotoOldExperienceAddress();
      await expect(page).toHaveURL(to);
      await expect(about.roles.first()).toBeVisible();
    }
  });

  test('home features this website with its checks, source code and test plan', async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.projectHeading).toHaveText('This website');
    await home.projectQualityLink.click();
    await expect(new QualityPage(page).heading).toHaveText('Quality');

    await home.goto();
    await expect(home.projectRepoLink).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins',
    );
    await expect(home.projectTestPlanLink).toHaveAttribute('href', /test-plan\.md$/);
  });

  test('the old projects address leads to the featured project on the home page', async ({
    page,
  }) => {
    for (const [lang, to] of [
      ['en', /\/diogo\.martins\/#project$/],
      ['pt', /\/diogo\.martins\/pt\/#project$/],
    ] as const) {
      const home = new HomePage(page, lang);
      await home.gotoOldProjectsAddress();
      await expect(page).toHaveURL(to);
      await expect(home.project).toBeVisible();
    }
  });

  test('quality lists the gates every change passes, in the order they run', async ({ page }) => {
    const quality = new QualityPage(page);
    await quality.goto();

    await expect(quality.pullRequestGates).toContainText([
      'Static analysis',
      'Unit tests',
      'End-to-end tests',
      'Accessibility',
      'Phone screens',
      'Visual changes',
      'Performance and SEO',
      'Broken links',
    ]);
    await expect(quality.deployGates).toContainText([
      'Deploy from a green build only',
      'Live smoke test',
    ]);
  });

  test('quality shows the results of the build, or says why there are none', async ({ page }) => {
    const quality = new QualityPage(page);
    await quality.goto();

    await expect(quality.results).toBeVisible();
    await expect(quality.ciHistoryLink).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins/actions/workflows/ci.yml',
    );
  });

  test('quality links to CLAUDE.md and every AI skill in the repository', async ({ page }) => {
    const quality = new QualityPage(page);
    await quality.goto();

    await expect(quality.claudeMdLink).toHaveAttribute(
      'href',
      'https://github.com/djamart/diogo.martins/blob/main/CLAUDE.md',
    );
    await expect(quality.skillLinks).toHaveCount(
      loadSkills(join(process.cwd(), '.claude', 'skills')).length,
    );
    await expect(quality.skillLinks.first()).toHaveAttribute(
      'href',
      /\/\.claude\/skills\/add-page\/SKILL\.md$/,
    );
    await expect(quality.testPlanLink).toHaveAttribute('href', /test-plan\.md$/);
  });
});
