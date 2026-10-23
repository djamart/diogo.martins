import { expect, test } from '@playwright/test';
import { experience } from '../src/data/profile';
import { ui } from '../src/i18n/ui';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
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
      const portugueseSite = new SitePage(page, 'pt');
      await site.goto(english.path);

      await site.header.languageMenu.choose('pt');
      await expect(portugueseSite.heading).toHaveText(portuguese.heading);
      await portugueseSite.header.showNav();
      await expect(portugueseSite.header.navLink(portuguese.name)).toHaveAttribute(
        'aria-current',
        'page',
      );
      await portugueseSite.header.hideNav();

      await portugueseSite.header.languageMenu.choose('en');
      await expect(site.heading).toHaveText(english.heading);
      await site.header.showNav();
      await expect(site.header.navLink(english.name)).toHaveAttribute('aria-current', 'page');
    });
  }

  test('switching language keeps the page where it was', async ({ page }) => {
    const english = new AboutPage(page);
    const portuguese = new AboutPage(page, 'pt');
    await english.goto();
    await english.scrollDown();
    const position = await english.scrollPosition();

    await english.header.languageMenu.choose('pt');

    await expect(portuguese.heading).toHaveText(ui.pt['about.title']);
    // Near, not to the pixel: the other language wraps differently, and the browser keeps the text
    // in view while the web fonts settle the layout. A couple of lines either way is the same place.
    await expect
      .poll(async () => Math.abs((await portuguese.scrollPosition()) - position))
      .toBeLessThanOrEqual(60);
  });

  test('the language button shows the current language by its short name', async ({ page }) => {
    const english = new SitePage(page);
    await english.goto('');
    await expect(english.header.languageMenu.button).toHaveText('EN');

    const portuguese = new SitePage(page, 'pt');
    await portuguese.goto('');
    await expect(portuguese.header.languageMenu.button).toHaveText('PT');
  });

  test('the language menu opens below the button and marks the current language', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const about = new AboutPage(page, 'pt');
    const { languageMenu } = about.header;
    await about.goto();
    await expect(languageMenu.menu).toBeHidden();

    await languageMenu.button.click();

    await expect(languageMenu.button).toHaveAttribute('aria-expanded', 'true');
    await expect(languageMenu.menu).toBeInViewport({ ratio: 1 });
    const button = await languageMenu.button.boundingBox();
    const menu = await languageMenu.menu.boundingBox();
    expect(menu!.y).toBeGreaterThanOrEqual(button!.y + button!.height);
    await expect(languageMenu.option('pt')).toHaveAttribute('aria-current', 'true');
    await expect(languageMenu.option('en')).not.toHaveAttribute('aria-current');
  });

  test('the language menu can be used with the keyboard', async ({ page }) => {
    const contact = new ContactPage(page);
    const { languageMenu } = contact.header;
    await contact.goto();

    await languageMenu.button.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(languageMenu.option('en')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(languageMenu.option('pt')).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(contact.heading).toHaveText('Contacto');
  });

  test('Escape closes the language menu and returns focus to the button', async ({ page }) => {
    const site = new SitePage(page);
    const { languageMenu } = site.header;
    await site.goto('');
    await languageMenu.button.click();
    await languageMenu.option('en').focus();

    await page.keyboard.press('Escape');

    await expect(languageMenu.menu).toBeHidden();
    await expect(languageMenu.button).toBeFocused();
    await expect(languageMenu.button).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking elsewhere closes the language menu', async ({ page }) => {
    const site = new SitePage(page);
    const { languageMenu } = site.header;
    await site.goto('');
    await languageMenu.button.click();
    await expect(languageMenu.menu).toBeVisible();

    await site.heading.click();

    await expect(languageMenu.menu).toBeHidden();
  });

  for (const sitePage of sitePages) {
    test(`${pageLabel(sitePage)} page declares its language and lists its translations`, async ({
      page,
    }) => {
      const site = new SitePage(page, sitePage.lang);
      await site.goto(sitePage.path);
      const suffix = sitePage.path === '' ? '/diogo.martins/' : `/diogo.martins/${sitePage.path}/`;
      const ptSuffix = suffix.replace('/diogo.martins/', '/diogo.martins/pt/');

      await expect(site.root).toHaveAttribute('lang', sitePage.lang === 'pt' ? 'pt-PT' : 'en');
      await expect(site.head.alternate('en')).toHaveAttribute(
        'href',
        new RegExp(`^https://.*${suffix}$`),
      );
      await expect(site.head.alternate('pt-PT')).toHaveAttribute(
        'href',
        new RegExp(`^https://.*${ptSuffix}$`),
      );
      await expect(site.head.alternate('x-default')).toHaveAttribute(
        'href',
        new RegExp(`^https://.*${suffix}$`),
      );
    });
  }

  test('the Portuguese home page is in European Portuguese', async ({ page }) => {
    const home = new HomePage(page, 'pt');
    await home.goto();

    await expect(home.heading).toHaveText(ui.pt['home.greeting']);
    await expect(home.headline).toHaveText(ui.pt['home.headline']);
    await expect(home.pillars).toHaveText([
      'Automação de testes',
      'Engenharia de qualidade',
      'Testes com IA',
    ]);
    await home.header.showNav();
    await expect(home.header.navLink('Contacto')).toBeVisible();
  });

  test('the Portuguese about page lists roles from the most recent, in Portuguese', async ({
    page,
  }) => {
    const about = new AboutPage(page, 'pt');
    await about.goto();

    await expect(about.roles).toHaveCount(experience.length);
    await expect(about.roles.first()).toContainText('Capital on Tap');
    await expect(about.roles.first()).toContainText('presente');
    await expect(about.roles.first()).toContainText(experience[0].summary.pt);
  });

  test('the Portuguese pages offer the English CV and say it is in English', async ({ page }) => {
    const home = new HomePage(page, 'pt');
    const contact = new ContactPage(page, 'pt');

    for (const [pageObject, link] of [
      [home, home.cvCta],
      [contact, contact.cv],
    ] as const) {
      await pageObject.goto();

      await expect(link).toHaveAttribute('href', /\/diogo\.martins\/diogo-martins-cv\.pdf$/);
      await expect(link).toHaveAttribute('hreflang', 'en');
      await expect(link).toContainText('em inglês');
    }
  });

  test('the Portuguese contact page has no phone number either', async ({ page }) => {
    const contact = new ContactPage(page, 'pt');
    await contact.goto();

    await expect(contact.email).toHaveAttribute('href', /^mailto:/);
    await expect(contact.phoneLinks).toHaveCount(0);
  });

  test('the theme chosen in one language stays in the other', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const site = new SitePage(page);
    await site.goto('');
    await site.header.themeMenu.choose('Dark');

    await site.header.languageMenu.choose('pt');

    await expect(site.root).toHaveAttribute('lang', 'pt-PT');
    await expect(site.root).toHaveAttribute('data-theme', 'dark');
  });

  test('a missing Portuguese address shows the page not found in Portuguese', async ({ page }) => {
    const notFound = new NotFoundPage(page, 'pt');
    await notFound.goto('projectos/antigo');

    await expect(notFound.root).toHaveAttribute('lang', 'pt-PT');
    await expect(notFound.heading).toHaveText(ui.pt['notFound.heading']);
    await expect(notFound.missingPath).toHaveText(/\/pt\/projectos\/antigo$/);
    await expect(notFound.homeLink).toHaveText(ui.pt['notFound.back']);
  });

  test('the page not found offers the Portuguese home page', async ({ page }) => {
    const notFound = new NotFoundPage(page);
    await notFound.goto();

    await notFound.header.languageMenu.choose('pt');

    await expect(notFound.root).toHaveAttribute('lang', 'pt-PT');
    await expect(new HomePage(page, 'pt').heading).toHaveText(ui.pt['home.greeting']);
  });
});
