import type { Locator, Page } from '@playwright/test';
import { ui, type Lang } from '../../../src/i18n/ui';

/** The footer on every page: ways to get in touch and a link to the source code. */
export class Footer {
  readonly contact: Locator;
  readonly email: Locator;
  readonly linkedin: Locator;
  readonly github: Locator;
  /** Every way to get in touch in the footer, in order. */
  readonly contactLinks: Locator;
  readonly sourceLink: Locator;

  constructor(page: Page, lang: Lang) {
    this.contact = page.getByRole('region', { name: ui[lang]['footer.contactTitle'] });
    this.email = page.getByTestId('footer-email');
    this.linkedin = page.getByTestId('footer-linkedin');
    this.github = page.getByTestId('footer-github');
    this.contactLinks = this.contact.getByRole('link');
    this.sourceLink = page.getByTestId('link-source');
  }

  /** The visible text of a contact link, without its icon. */
  labelOf(link: Locator, label: string): Locator {
    return link.getByText(label, { exact: true });
  }
}
