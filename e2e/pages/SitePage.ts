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

export type SitePath = (typeof sitePages)[number]['path'];

/** Any page of the site: the shared header, navigation and main heading. */
export class SitePage {
  readonly body: Locator;
  readonly heading: Locator;
  readonly nav: Locator;
  readonly skipLink: Locator;
  readonly themePicker: Locator;

  constructor(private readonly page: Page) {
    this.body = page.locator('body');
    this.heading = page.getByRole('heading', { level: 1 });
    this.nav = page.getByRole('navigation', { name: 'Main' });
    this.skipLink = page.getByRole('link', { name: 'Skip to content' });
    this.themePicker = page.getByRole('group', { name: 'Theme' });
  }

  async goto(path: SitePath) {
    return this.page.goto(path === '' ? './' : `./${path}/`);
  }

  /** An option in the header theme picker: 'Light', 'Dark' or 'System'. */
  themeOption(name: 'Light' | 'Dark' | 'System'): Locator {
    return this.themePicker.getByRole('radio', { name, exact: true });
  }

  navLink(name: string): Locator {
    return this.nav.getByRole('link', { name, exact: true });
  }
}
