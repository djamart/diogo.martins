import type { Locator, Page } from '@playwright/test';
import type { Lang } from '../../src/i18n/ui';
import { SitePage } from './SitePage';

export class HomePage extends SitePage {
  readonly role: Locator;
  readonly headline: Locator;
  /** The name of each focus area, one card each. */
  readonly pillars: Locator;
  readonly contactCta: Locator;
  readonly experienceCta: Locator;
  readonly cvCta: Locator;
  /** The featured project: this website. */
  readonly project: Locator;
  readonly projectHeading: Locator;
  readonly projectQualityLink: Locator;
  readonly projectRepoLink: Locator;
  readonly projectTestPlanLink: Locator;

  constructor(page: Page, lang: Lang = 'en') {
    super(page, lang);
    this.role = page.getByTestId('role');
    this.headline = page.getByTestId('headline');
    this.pillars = page.getByTestId('pillars').getByRole('heading', { level: 3 });
    this.contactCta = page.getByTestId('cta-contact');
    this.experienceCta = page.getByTestId('cta-experience');
    this.cvCta = page.getByTestId('cta-cv');
    this.project = page.getByTestId('project');
    this.projectHeading = this.project.getByRole('heading');
    this.projectQualityLink = this.project.getByTestId('link-quality');
    this.projectRepoLink = this.project.getByTestId('link-repo');
    this.projectTestPlanLink = this.project.getByTestId('link-test-plan');
  }

  /** The address the featured project had when it was a page of its own. */
  async gotoOldProjectsAddress() {
    return this.page.goto(`${this.prefix}projects/`);
  }
}
