import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly heading: Locator;
  readonly role: Locator;
  readonly headline: Locator;
  readonly pillars: Locator;
  readonly project: Locator;
  readonly contactCta: Locator;
  readonly experienceCta: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.role = page.getByTestId('role');
    this.headline = page.getByTestId('headline');
    /** The name of each focus area, one card each. */
    this.pillars = page.getByTestId('pillars').getByRole('heading', { level: 3 });
    this.project = page.getByTestId('project');
    this.contactCta = page.getByTestId('cta-contact');
    this.experienceCta = page.getByTestId('cta-experience');
  }

  async goto() {
    return this.page.goto('./');
  }
}
