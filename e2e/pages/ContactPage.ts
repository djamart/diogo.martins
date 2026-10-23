import type { Download, Locator, Page } from '@playwright/test';
import type { Lang } from '../../src/i18n/ui';
import { SitePage } from './SitePage';

export class ContactPage extends SitePage {
  protected override readonly path = 'contact';
  readonly email: Locator;
  readonly linkedin: Locator;
  readonly github: Locator;
  readonly cv: Locator;
  /** Links that would call a phone number; the site promises there are none. */
  readonly phoneLinks: Locator;

  constructor(page: Page, lang: Lang = 'en') {
    super(page, lang);
    this.email = page.getByTestId('contact-email');
    this.linkedin = page.getByTestId('contact-linkedin');
    this.github = page.getByTestId('contact-github');
    this.cv = page.getByTestId('contact-cv');
    this.phoneLinks = page.locator('a[href^="tel:"]');
  }

  /** Clicks the CV link and returns the download it starts. */
  async downloadCv(): Promise<Download> {
    const [download] = await Promise.all([this.page.waitForEvent('download'), this.cv.click()]);
    return download;
  }
}
