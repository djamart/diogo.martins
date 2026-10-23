import type { Locator, Page } from '@playwright/test';
import { ui, type Lang } from '../../src/i18n/ui';
import { SitePage } from './SitePage';

export class AboutPage extends SitePage {
  protected override readonly path = 'about';
  readonly experienceHeading: Locator;
  /** One entry per role in the experience timeline. */
  readonly roles: Locator;
  readonly certifications: Locator;

  constructor(page: Page, lang: Lang = 'en') {
    super(page, lang);
    this.experienceHeading = page.getByRole('heading', {
      name: ui[lang]['experience.title'],
      level: 2,
    });
    this.roles = page.getByTestId('role');
    this.certifications = page.getByTestId('certifications').getByRole('listitem');
  }

  /** A section heading, to check which sections the page has. */
  sectionHeading(name: string): Locator {
    return this.page.getByRole('heading', { name });
  }

  /** The address the experience had when it was a page of its own. */
  async gotoOldExperienceAddress() {
    return this.page.goto(`${this.prefix}experience/`);
  }
}
