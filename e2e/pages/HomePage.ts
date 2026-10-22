import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly heading: Locator;
  readonly role: Locator;
  readonly contactCta: Locator;
  readonly experienceCta: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.role = page.getByTestId('role');
    this.contactCta = page.getByTestId('cta-contact');
    this.experienceCta = page.getByTestId('cta-experience');
  }

  async goto() {
    return this.page.goto('./');
  }
}
