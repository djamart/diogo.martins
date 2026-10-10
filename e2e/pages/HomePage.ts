import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly heading: Locator;
  readonly githubLink: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.githubLink = page.getByTestId('link-github');
  }

  async goto() {
    return this.page.goto('./');
  }
}
