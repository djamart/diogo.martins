import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formAccessKey } from '../src/contact/form';
import { contactLinks } from '../src/data/profile';
import { ui } from '../src/i18n/ui';
import { ContactPage } from './pages/ContactPage';

// Every test answers for Web3Forms itself (fakeFormService), so no run sends a real message.
const en = ui.en;
const pt = ui.pt;
const message = {
  name: 'Ana Silva',
  email: 'ana@example.com',
  message: 'Hi Diogo, we have a QA role you might like.',
};

test.describe('Contact form', () => {
  test('a filled-in message is sent and the visitor is thanked', async ({ page }) => {
    const contact = new ContactPage(page);
    const sent = await contact.fakeFormService('accepted');
    await contact.goto();

    await contact.sendMessage(message);

    await expect(contact.formStatus).toHaveText(en['contact.form.success']);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ access_key: formAccessKey, ...message, botcheck: false });
    await expect(contact.nameField).toHaveValue('');
    await expect(contact.messageField).toHaveValue('');
  });

  test('an empty form shows what is missing, focuses the first field and sends nothing', async ({
    page,
  }) => {
    const contact = new ContactPage(page);
    const sent = await contact.fakeFormService('accepted');
    await contact.goto();

    await contact.sendMessage({});

    await expect(contact.nameField).toBeFocused();
    for (const [field, input, key] of [
      ['name', contact.nameField, 'contact.error.nameMissing'],
      ['email', contact.emailField, 'contact.error.emailMissing'],
      ['message', contact.messageField, 'contact.error.messageMissing'],
    ] as const) {
      await expect(contact.fieldError(field)).toHaveText(en[key]);
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveAccessibleDescription(en[key]);
    }
    expect(sent).toHaveLength(0);
  });

  test('a mistyped email address is pointed out, and fixing it clears the error', async ({
    page,
  }) => {
    const contact = new ContactPage(page);
    const sent = await contact.fakeFormService('accepted');
    await contact.goto();

    await contact.sendMessage({ ...message, email: 'ana@example' });

    await expect(contact.emailField).toBeFocused();
    await expect(contact.fieldError('email')).toHaveText(en['contact.error.emailInvalid']);
    expect(sent).toHaveLength(0);

    await contact.sendMessage(message);

    await expect(contact.fieldError('email')).toBeHidden();
    await expect(contact.emailField).not.toHaveAttribute('aria-invalid');
    await expect(contact.formStatus).toHaveText(en['contact.form.success']);
  });

  for (const answer of ['rejected', 'offline'] as const) {
    test(`when the form service is ${answer}, the visitor keeps the message and gets the email address`, async ({
      page,
    }) => {
      const contact = new ContactPage(page);
      await contact.fakeFormService(answer);
      await contact.goto();

      await contact.sendMessage(message);

      await expect(contact.formFailure).toContainText(en['contact.form.failure']);
      await expect(contact.failureEmail).toHaveAttribute(
        'href',
        contactLinks.find((link) => link.id === 'email')!.href,
      );
      await expect(contact.messageField).toHaveValue(message.message);
      await expect(contact.sendButton).toBeEnabled();
    });
  }

  test('the Portuguese form speaks Portuguese', async ({ page }) => {
    const contact = new ContactPage(page, 'pt');
    await contact.fakeFormService('accepted');
    await contact.goto();

    await contact.sendMessage({ ...message, email: '' });
    await expect(contact.fieldError('email')).toHaveText(pt['contact.error.emailMissing']);

    await contact.sendMessage(message);
    await expect(contact.formStatus).toHaveText(pt['contact.form.success']);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`the form showing errors has no serious accessibility violations (${colorScheme} theme)`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      const contact = new ContactPage(page);
      await contact.fakeFormService('accepted');
      await contact.goto();
      await contact.sendMessage({});
      await expect(contact.fieldError('name')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const serious = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );

      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
});
