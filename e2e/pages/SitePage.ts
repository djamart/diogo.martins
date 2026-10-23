import type { Locator, Page } from '@playwright/test';
import type { Lang } from '../../src/i18n/ui';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { PageHead } from './components/PageHead';

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

/**
 * Any page of the site in one language: the parts every page shares. The page objects of single
 * pages extend it with their own content and the path `goto()` opens.
 */
export class SitePage {
  /** The <html> element, which carries the page language and the chosen theme. */
  readonly root: Locator;
  readonly body: Locator;
  readonly heading: Locator;
  /** Elements that take keyboard focus without being a control, such as a heading. */
  readonly focusableNonControls: Locator;
  readonly header: Header;
  readonly footer: Footer;
  readonly head: PageHead;
  protected readonly path: SitePath = '';

  constructor(
    protected readonly page: Page,
    readonly lang: Lang = 'en',
  ) {
    this.root = page.locator('html');
    this.body = page.locator('body');
    this.heading = page.getByRole('heading', { level: 1 });
    // A tabindex attribute has no role or name to find it by.
    this.focusableNonControls = page.locator('[tabindex]:not(a, button, input, select, textarea)');
    this.header = new Header(page, lang);
    this.footer = new Footer(page, lang);
    this.head = new PageHead(page);
  }

  /** The address of the site's home page in this page object's language. */
  protected get prefix() {
    return this.lang === 'en' ? './' : `./${this.lang}/`;
  }

  /** Opens a page in this page object's language; by default the one this page object is for. */
  async goto(path: SitePath = this.path) {
    return this.page.goto(path === '' ? this.prefix : `${this.prefix}${path}/`);
  }

  /** How far the page can be scrolled sideways; anything above zero means content is cut off. */
  async horizontalOverflow(): Promise<number> {
    return this.page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
  }

  /** Where the main navigation starts from the left of the window, in pixels. */
  async navLeftEdge(): Promise<number | undefined> {
    return (await this.header.nav.boundingBox())?.x;
  }

  /** Waits for the web fonts, since text set in a fallback font would shift every line. */
  async fontsLoaded() {
    await this.page.evaluate(() => document.fonts.ready);
  }
}
