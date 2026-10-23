import type { Locator, Page } from '@playwright/test';
import { ui, type Lang } from '../../../src/i18n/ui';
import { LanguageMenu } from './LanguageMenu';
import { ThemeMenu } from './ThemeMenu';

/** The header on every page: skip link, main navigation, language and theme menus. */
export class Header {
  /** The header itself, which stays at the top of the window while the page scrolls. */
  readonly bar: Locator;
  readonly skipLink: Locator;
  /** The main navigation where it is showing: in the header, or in the menu panel when open. */
  readonly nav: Locator;
  /** The button that holds the menu links when they do not fit in the header. */
  readonly menuButton: Locator;
  /** The panel the menu button opens from the left. */
  readonly menuPanel: Locator;
  readonly menuCloseButton: Locator;
  /** The menu links marked as the page being shown; there should be exactly one. */
  readonly currentLinks: Locator;
  readonly languageMenu: LanguageMenu;
  readonly themeMenu: ThemeMenu;

  constructor(
    private readonly page: Page,
    lang: Lang,
  ) {
    const t = ui[lang];
    this.bar = page.getByRole('banner');
    this.skipLink = page.getByRole('link', { name: t['nav.skip'] });
    this.nav = page.getByRole('navigation', { name: t['nav.label'] });
    this.menuButton = page.getByRole('button', { name: t['nav.open'] });
    this.menuPanel = page.getByRole('dialog', { name: t['nav.menu'] });
    this.menuCloseButton = this.menuPanel.getByRole('button', { name: t['nav.close'] });
    this.currentLinks = this.nav.locator('[aria-current="page"]');
    this.languageMenu = new LanguageMenu(page, lang);
    this.themeMenu = new ThemeMenu(page, lang);
  }

  /** Opens the menu panel if the links are folded into the menu button, so they can be reached. */
  async showNav() {
    if ((await this.menuButton.isVisible()) && !(await this.menuPanel.isVisible())) {
      await this.menuButton.click();
    }
  }

  /** Closes the menu panel if it is open, so the rest of the page can be used again. */
  async hideNav() {
    if (await this.menuPanel.isVisible()) await this.menuCloseButton.click();
  }

  /** Opens a page from the main navigation, through the menu panel if the links are folded. */
  async goToPage(name: string) {
    await this.showNav();
    await this.navLink(name).click();
  }

  /** A link in the main navigation, by its name in the page's language. */
  navLink(name: string): Locator {
    return this.nav.getByRole('link', { name, exact: true });
  }

  /** How many rows the links in the main navigation take up. */
  async navRowCount(): Promise<number> {
    const boxes = await Promise.all(
      (await this.nav.getByRole('link').all()).map((link) => link.boundingBox()),
    );
    return new Set(boxes.map((box) => Math.round(box?.y ?? 0))).size;
  }

  /** Closes the menu panel by clicking the page beside it. */
  async closeMenuFromOutside() {
    // Near the right edge, clear of the panel even while it slides in, and of the scrollbar.
    const size = this.page.viewportSize();
    if (size) await this.page.mouse.click(size.width - 32, size.height / 2);
  }
}
