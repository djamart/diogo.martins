import type { Locator, Page } from '@playwright/test';
import type { Lang } from '../../src/i18n/ui';
import { SitePage } from './SitePage';

/**
 * The page shown for an address the site does not have, written as a failed test. GitHub Pages
 * serves the English one for every address; under /pt/ it sends the visitor to the Portuguese one.
 */
export class NotFoundPage extends SitePage {
  /** The failed test: the address, what was expected and what came back. */
  readonly testReport: Locator;
  readonly missingPath: Locator;
  readonly homeLink: Locator;

  constructor(page: Page, lang: Lang = 'en') {
    super(page, lang);
    this.testReport = page.getByTestId('test-report');
    this.missingPath = page.getByTestId('missing-path');
    this.homeLink = page.getByTestId('link-home');
  }

  /** Opens an address the site does not have, under this page object's language. */
  override async goto(address = 'this-page-does-not-exist') {
    return this.page.goto(`${this.prefix}${address}`);
  }
}
