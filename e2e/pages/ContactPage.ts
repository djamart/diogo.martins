import type { Download, Locator, Page } from '@playwright/test';
import { formEndpoint } from '../../src/contact/form';
import { ui, type Lang } from '../../src/i18n/ui';
import { SitePage } from './SitePage';

/** What the fake form service answers: Web3Forms' JSON for a sent message, or an error. */
export type FormServiceAnswer = 'accepted' | 'rejected' | 'offline';

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export class ContactPage extends SitePage {
  protected override readonly path = 'contact';
  readonly email: Locator;
  readonly linkedin: Locator;
  readonly github: Locator;
  readonly cv: Locator;
  readonly form: Locator;
  readonly nameField: Locator;
  readonly emailField: Locator;
  readonly messageField: Locator;
  readonly sendButton: Locator;
  /** Where the form says it is sending, or that the message arrived. */
  readonly formStatus: Locator;
  /** The message shown when sending fails, with the email address to use instead. */
  readonly formFailure: Locator;
  readonly failureEmail: Locator;
  /** Links that would call a phone number; the site promises there are none. */
  readonly phoneLinks: Locator;

  constructor(page: Page, lang: Lang = 'en') {
    super(page, lang);
    this.email = page.getByTestId('contact-email');
    this.linkedin = page.getByTestId('contact-linkedin');
    this.github = page.getByTestId('contact-github');
    this.cv = page.getByTestId('contact-cv');
    this.phoneLinks = page.locator('a[href^="tel:"]');
    const strings = ui[lang];
    this.form = page.getByTestId('contact-form');
    this.nameField = this.form.getByLabel(strings['contact.form.name'], { exact: true });
    this.emailField = this.form.getByLabel(strings['contact.form.email'], { exact: true });
    this.messageField = this.form.getByLabel(strings['contact.form.message'], { exact: true });
    this.sendButton = this.form.getByRole('button', { name: strings['contact.form.submit'] });
    this.formStatus = page.getByTestId('contact-form-status');
    this.formFailure = page.getByTestId('contact-form-failure');
    this.failureEmail = this.formFailure.getByRole('link');
  }

  /**
   * Answers the form's requests to Web3Forms in place of the real service, so no test ever sends
   * a message. Returns the JSON bodies the page sent, in order.
   */
  async fakeFormService(answer: FormServiceAnswer): Promise<Record<string, unknown>[]> {
    const sent: Record<string, unknown>[] = [];
    await this.page.route(formEndpoint, async (route) => {
      sent.push(route.request().postDataJSON());
      if (answer === 'offline') return route.abort('internetdisconnected');
      const success = answer === 'accepted';
      await route.fulfill({
        status: success ? 200 : 400,
        json: { success, message: success ? 'Email sent successfully!' : 'Invalid access key' },
      });
    });
    return sent;
  }

  /** Fills in the form, leaving out the fields not given, and sends it. */
  async sendMessage(message: Partial<ContactMessage>): Promise<void> {
    await this.nameField.fill(message.name ?? '');
    await this.emailField.fill(message.email ?? '');
    await this.messageField.fill(message.message ?? '');
    await this.sendButton.click();
  }

  /** The error shown under a field, which the field also gives as its accessible description. */
  fieldError(field: 'name' | 'email' | 'message'): Locator {
    return this.page.getByTestId(`contact-${field}-error`);
  }

  /** Clicks the CV link and returns the download it starts. */
  async downloadCv(): Promise<Download> {
    const [download] = await Promise.all([this.page.waitForEvent('download'), this.cv.click()]);
    return download;
  }
}
