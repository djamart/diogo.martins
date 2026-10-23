import type { Locator, Page } from '@playwright/test';
import { ui, type Lang } from '../../src/i18n/ui';

/** The pages in the main navigation in every language, by their path relative to the site base. */
export const sitePages = [
  { lang: 'en', path: '', name: 'Home', heading: /Diogo Martins/ },
  { lang: 'en', path: 'about', name: 'About', heading: 'About' },
  { lang: 'en', path: 'quality', name: 'Quality', heading: 'Quality' },
  { lang: 'en', path: 'blog', name: 'Blog', heading: 'Blog' },
  { lang: 'en', path: 'contact', name: 'Contact', heading: 'Contact' },
  { lang: 'pt', path: '', name: 'Início', heading: /Diogo Martins/ },
  { lang: 'pt', path: 'about', name: 'Sobre', heading: 'Sobre' },
  { lang: 'pt', path: 'quality', name: 'Qualidade', heading: 'Qualidade' },
  { lang: 'pt', path: 'blog', name: 'Blog', heading: 'Blog' },
  { lang: 'pt', path: 'contact', name: 'Contacto', heading: 'Contacto' },
] as const satisfies { lang: Lang; path: string; name: string; heading: string | RegExp }[];

export type SitePageInfo = (typeof sitePages)[number];

export type SitePath = SitePageInfo['path'];

/** The pages of one language, in menu order. */
export function pagesIn(lang: Lang): SitePageInfo[] {
  return sitePages.filter((page) => page.lang === lang);
}

/** How a page reads in a test name: "About", or "Sobre (pt)" for a translation. */
export function pageLabel({ lang, name }: SitePageInfo): string {
  return lang === 'en' ? name : `${name} (${lang})`;
}

export type ThemeOptionName = 'Light' | 'Dark' | 'System';

/** Any page of the site in one language: the shared header, navigation and main heading. */
export class SitePage {
  readonly body: Locator;
  readonly heading: Locator;
  readonly nav: Locator;
  readonly skipLink: Locator;
  readonly themeButton: Locator;
  readonly themeMenu: Locator;
  readonly languageButton: Locator;
  readonly languageMenu: Locator;
  readonly footerContact: Locator;

  constructor(
    private readonly page: Page,
    readonly lang: Lang = 'en',
  ) {
    const t = ui[lang];
    this.body = page.locator('body');
    this.heading = page.getByRole('heading', { level: 1 });
    this.nav = page.getByRole('navigation', { name: t['nav.label'] });
    this.skipLink = page.getByRole('link', { name: t['nav.skip'] });
    this.themeButton = page.getByRole('button', { name: t['theme.label'] });
    this.themeMenu = page.getByRole('menu', { name: t['theme.label'] });
    this.languageButton = page.getByRole('button', {
      name: `${t['language.label']}: ${lang.toUpperCase()}`,
    });
    this.languageMenu = page.getByTestId('language-menu').getByRole('list');
    this.footerContact = page.getByRole('region', { name: t['footer.contactTitle'] });
  }

  async goto(path: SitePath) {
    const prefix = this.lang === 'en' ? './' : `./${this.lang}/`;
    return this.page.goto(path === '' ? prefix : `${prefix}${path}/`);
  }

  /** An option in the header theme menu. Visible only while the menu is open. */
  themeOption(name: ThemeOptionName): Locator {
    return this.themeMenu.getByRole('menuitemradio', { name, exact: true });
  }

  /** Opens the theme menu and picks an option with the mouse. */
  async chooseTheme(name: ThemeOptionName) {
    await this.themeButton.click();
    await this.themeOption(name).click();
  }

  navLink(name: string): Locator {
    return this.nav.getByRole('link', { name, exact: true });
  }

  /** A language in the header language menu, named in that language. Visible only while open. */
  languageOption(name: string): Locator {
    return this.languageMenu.getByRole('link', { name, exact: true });
  }

  /** Opens the language menu and picks a language with the mouse. */
  async chooseLanguage(name: string) {
    await this.languageButton.click();
    await this.languageOption(name).click();
  }
}
