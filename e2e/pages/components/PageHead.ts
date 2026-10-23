import type { Locator, Page } from '@playwright/test';

/**
 * What a page declares in its <head> for browsers, search engines and feed readers. These <link>
 * elements have no role, so they are found by their attributes, the way those tools read them.
 */
export class PageHead {
  readonly icon: Locator;
  readonly feed: Locator;
  /** The page in each language it exists in, without the x-default fallback. */
  readonly translations: Locator;

  constructor(private readonly page: Page) {
    this.icon = page.locator('link[rel="icon"]');
    this.feed = page.locator('link[rel="alternate"][type="application/rss+xml"]');
    this.translations = page.locator('link[rel="alternate"][hreflang]:not([hreflang="x-default"])');
  }

  /** The address of the page in one language, by its language tag, or `x-default`. */
  alternate(hreflang: string): Locator {
    return this.page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`);
  }
}
