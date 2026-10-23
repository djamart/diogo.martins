import type { Locator, Page } from '@playwright/test';

/** The pages in the main navigation, by their path relative to the site base. */
export const sitePages = [
  { path: '', name: 'Home', heading: /Diogo Martins/ },
  { path: 'about', name: 'About', heading: 'About' },
  { path: 'experience', name: 'Experience', heading: 'Experience' },
  { path: 'projects', name: 'Projects', heading: 'Projects' },
  { path: 'quality', name: 'Quality', heading: 'Quality' },
  { path: 'contact', name: 'Contact', heading: 'Contact' },
] as const;

export type ThemeOptionName = 'Light' | 'Dark' | 'System';

export type SitePath = (typeof sitePages)[number]['path'];

/** Any page of the site: the shared header, navigation and main heading. */
export class SitePage {
  readonly body: Locator;
  readonly heading: Locator;
  readonly nav: Locator;
  readonly skipLink: Locator;
  readonly themeButton: Locator;
  readonly themeMenu: Locator;

  constructor(private readonly page: Page) {
    this.body = page.locator('body');
    this.heading = page.getByRole('heading', { level: 1 });
    this.nav = page.getByRole('navigation', { name: 'Main' });
    this.skipLink = page.getByRole('link', { name: 'Skip to content' });
    this.themeButton = page.getByRole('button', { name: 'Theme' });
    this.themeMenu = page.getByRole('menu', { name: 'Theme' });
  }

  async goto(path: SitePath) {
    return this.page.goto(path === '' ? './' : `./${path}/`);
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
}
