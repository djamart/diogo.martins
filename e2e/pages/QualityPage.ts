import type { Locator, Page } from '@playwright/test';
import type { Lang } from '../../src/i18n/ui';
import { SitePage } from './SitePage';

export class QualityPage extends SitePage {
  protected override readonly path = 'quality';
  /** The gates every pull request passes, in the order they run. */
  readonly pullRequestGates: Locator;
  /** The gates between a green build and the live site. */
  readonly deployGates: Locator;
  /** The results of the build, or the note that says why there are none. */
  readonly results: Locator;
  readonly ciHistoryLink: Locator;
  readonly claudeMdLink: Locator;
  readonly skillLinks: Locator;
  readonly testPlanLink: Locator;

  constructor(page: Page, lang: Lang = 'en') {
    super(page, lang);
    this.pullRequestGates = page.getByTestId('gates-pull-request').getByTestId('gate');
    this.deployGates = page.getByTestId('gates-deploy').getByTestId('gate');
    this.results = page.getByTestId('results').or(page.getByTestId('results-unavailable'));
    this.ciHistoryLink = page.getByTestId('link-ci-history');
    this.claudeMdLink = page.getByTestId('link-claude-md');
    this.skillLinks = page.getByTestId('skills').getByRole('link');
    this.testPlanLink = page.getByTestId('link-quality-test-plan');
  }
}
