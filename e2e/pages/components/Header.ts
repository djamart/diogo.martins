import type { Locator, Page } from '@playwright/test';
import { ui, type Lang } from '../../../src/i18n/ui';
import { LanguageMenu } from './LanguageMenu';
import { ThemeMenu } from './ThemeMenu';

/** The header on every page: skip link, main navigation, language and theme menus. */
export class Header {
  /** The header itself, which stays at the top of the window while the page scrolls. */
  readonly bar: Locator;
  readonly skipLink: Locator;
  readonly nav: Locator;
  /** The menu links marked as the page being shown; there should be exactly one. */
  readonly currentLinks: Locator;
  readonly languageMenu: LanguageMenu;
  readonly themeMenu: ThemeMenu;

  constructor(page: Page, lang: Lang) {
    const t = ui[lang];
    this.bar = page.getByRole('banner');
    this.skipLink = page.getByRole('link', { name: t['nav.skip'] });
    this.nav = page.getByRole('navigation', { name: t['nav.label'] });
    this.currentLinks = this.nav.locator('[aria-current="page"]');
    this.languageMenu = new LanguageMenu(page, lang);
    this.themeMenu = new ThemeMenu(page, lang);
  }

  /** A link in the main navigation, by its name in the page's language. */
  navLink(name: string): Locator {
    return this.nav.getByRole('link', { name, exact: true });
  }
}
