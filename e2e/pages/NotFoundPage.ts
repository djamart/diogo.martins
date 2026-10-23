import type { Locator, Page } from '@playwright/test';
import { SitePage } from './SitePage';

/** The page shown for an address the site does not have. It exists in English only. */
export class NotFoundPage extends SitePage {
  readonly homeLink: Locator;

  constructor(page: Page) {
    super(page);
    this.homeLink = page.getByTestId('link-home');
  }

  override async goto() {
    return this.page.goto('./this-page-does-not-exist');
  }
}
