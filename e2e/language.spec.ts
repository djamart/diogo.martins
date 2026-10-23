import { expect, test } from '@playwright/test';
import { experience } from '../src/data/profile';
import { ui } from '../src/i18n/ui';
import { pageLabel, pagesIn, SitePage, sitePages } from './pages/SitePage';

test.describe('Language', () => {
  for (const [english, portuguese] of pagesIn('en').map((page, index) => [
    page,
    pagesIn('pt')[index],
  ])) {
    test(`${english.name} page switches to Portuguese and back on the same page`, async ({
      page,
    }) => {
      const site = new SitePage(page);
      await site.goto(english.path);

      await site.chooseLanguage('Português');
      await expect(site.heading).toHaveText(portuguese.heading);
      const portugueseSite = new SitePage(page, 'pt');
      await expect(portugueseSite.navLink(portuguese.name)).toHaveAttribute('aria-current', 'page');

      await portugueseSite.chooseLanguage('English');
      await expect(site.heading).toHaveText(english.heading);
      await expect(site.navLink(english.name)).toHaveAttribute('aria-current', 'page');
    });
  }

  test('the language button shows the current language by its short name', async ({ page }) => {
    const english = new SitePage(page);
    await english.goto('');
    await expect(english.languageButton).toHaveText('EN');

    const portuguese = new SitePage(page, 'pt');
    await portuguese.goto('');
    await expect(portuguese.languageButton).toHaveText('PT');
  });

  test('the language menu opens below the button and marks the current language', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const site = new SitePage(page, 'pt');
    await site.goto('about');
    await expect(site.languageMenu).toBeHidden();

    await site.languageButton.click();

    await expect(site.languageButton).toHaveAttribute('aria-expanded', 'true');
    await expect(site.languageMenu).toBeInViewport({ ratio: 1 });
    const button = await site.languageButton.boundingBox();
    const menu = await site.languageMenu.boundingBox();
    expect(menu!.y).toBeGreaterThanOrEqual(button!.y + button!.height);
    await expect(site.languageOption('Português')).toHaveAttribute('aria-current', 'true');
    await expect(site.languageOption('English')).not.toHaveAttribute('aria-current');
  });

  test('the language menu can be used with the keyboard', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('contact');

    await site.languageButton.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(site.languageOption('English')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(site.languageOption('Português')).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(site.heading).toHaveText('Contacto');
  });

  test('Escape closes the language menu and returns focus to the button', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');
    await site.languageButton.click();
    await site.languageOption('English').focus();

    await page.keyboard.press('Escape');

    await expect(site.languageMenu).toBeHidden();
    await expect(site.languageButton).toBeFocused();
    await expect(site.languageButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking elsewhere closes the language menu', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('');
    await site.languageButton.click();
    await expect(site.languageMenu).toBeVisible();

    await site.heading.click();

    await expect(site.languageMenu).toBeHidden();
  });

  for (const sitePage of sitePages) {
    test(`${pageLabel(sitePage)} page declares its language and lists its translations`, async ({
      page,
    }) => {
      await new SitePage(page, sitePage.lang).goto(sitePage.path);
      const suffix = sitePage.path === '' ? '/diogo.martins/' : `/diogo.martins/${sitePage.path}/`;
      const ptSuffix = suffix.replace('/diogo.martins/', '/diogo.martins/pt/');
      // <link> elements in the head have no role; search engines read their attributes.
      const alternate = (hreflang: string) =>
        page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`);

      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        sitePage.lang === 'pt' ? 'pt-PT' : 'en',
      );
      await expect(alternate('en')).toHaveAttribute('href', new RegExp(`^https://.*${suffix}$`));
      await expect(alternate('pt-PT')).toHaveAttribute(
        'href',
        new RegExp(`^https://.*${ptSuffix}$`),
      );
      await expect(alternate('x-default')).toHaveAttribute(
        'href',
        new RegExp(`^https://.*${suffix}$`),
      );
    });
  }

  test('the Portuguese home page is in European Portuguese', async ({ page }) => {
    const site = new SitePage(page, 'pt');
    await site.goto('');

    await expect(site.heading).toHaveText(ui.pt['home.greeting']);
    await expect(page.getByTestId('pillars')).toHaveText(
      'Automação de testes · Engenharia de qualidade · Testes com IA',
    );
    await expect(site.navLink('Contacto')).toBeVisible();
  });

  test('the Portuguese experience page lists roles from the most recent, in Portuguese', async ({
    page,
  }) => {
    await new SitePage(page, 'pt').goto('experience');
    const roles = page.getByTestId('role');

    await expect(roles).toHaveCount(experience.length);
    await expect(roles.first()).toContainText('Capital on Tap');
    await expect(roles.first()).toContainText('presente');
    await expect(roles.first()).toContainText(experience[0].summary.pt);
  });

  test('the Portuguese pages offer the English CV and say it is in English', async ({ page }) => {
    for (const [path, testId] of [
      ['', 'cta-cv'],
      ['contact', 'contact-cv'],
    ] as const) {
      await new SitePage(page, 'pt').goto(path);
      const link = page.getByTestId(testId);

      await expect(link).toHaveAttribute('href', /\/diogo\.martins\/diogo-martins-cv\.pdf$/);
      await expect(link).toHaveAttribute('hreflang', 'en');
      await expect(link).toContainText('em inglês');
    }
  });

  test('the Portuguese contact page has no phone number either', async ({ page }) => {
    await new SitePage(page, 'pt').goto('contact');

    await expect(page.getByTestId('contact-email')).toHaveAttribute('href', /^mailto:/);
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  });

  test('the theme chosen in one language stays in the other', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');
    await site.chooseTheme('Dark');

    await site.chooseLanguage('Português');

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('the page not found offers the Portuguese home page', async ({ page }) => {
    await page.goto('./this-page-does-not-exist');
    const site = new SitePage(page);

    await site.chooseLanguage('Português');

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT');
    await expect(site.heading).toHaveText(ui.pt['home.greeting']);
  });
});
