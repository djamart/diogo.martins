/**
 * The contact form: which fields it has, how they are checked and what goes to the form service.
 * GitHub Pages has no server, so Web3Forms (https://web3forms.com) receives each message and
 * forwards it to Diogo's inbox. The page script in contact.astro uses these to send it.
 */

import type { UiKey } from '../i18n/ui';

/** Where the form posts. Web3Forms answers with JSON: `{ success: boolean, message: string }`. */
export const formEndpoint = 'https://api.web3forms.com/submit';

/**
 * Tells Web3Forms which inbox the messages go to. It is public by design (it can only send to
 * that inbox), so it lives in the source like the email address does.
 */
export const formAccessKey = '5f5197d6-9aee-4ba6-b63f-a8a721feba7b';

export const formFields = ['name', 'email', 'message'] as const;

export type FormField = (typeof formFields)[number];

export type FormValues = Record<FormField, string>;

/** The longest message the form accepts, so a paste of a whole document is stopped early. */
export const messageMaxLength = 5000;

// Something before and after one @, and a dot in the domain: enough to catch a typo, without
// rejecting real addresses the way a strict pattern does.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The problem with each field that has one, as the key of its message in `src/i18n/ui.ts`. */
export function validateContact(values: FormValues): Partial<Record<FormField, UiKey>> {
  const errors: Partial<Record<FormField, UiKey>> = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) errors.name = 'contact.error.nameMissing';
  if (!email) errors.email = 'contact.error.emailMissing';
  else if (!emailPattern.test(email)) errors.email = 'contact.error.emailInvalid';
  if (!message) errors.message = 'contact.error.messageMissing';
  else if (message.length > messageMaxLength) errors.message = 'contact.error.messageTooLong';

  return errors;
}

/**
 * The JSON body sent to Web3Forms. `botcheck` is the hidden honeypot field: people never see it,
 * so a value there marks the message as spam. Web3Forms filters it out.
 */
export function contactSubmission(values: FormValues, botcheck: boolean) {
  const name = values.name.trim();
  return {
    access_key: formAccessKey,
    subject: `Message from ${name} via the website`,
    from_name: 'Diogo Martins website',
    name,
    email: values.email.trim(),
    message: values.message.trim(),
    botcheck,
  };
}

/** Whether Web3Forms accepted the message, from its JSON answer. */
export function isAccepted(response: unknown): boolean {
  return (
    typeof response === 'object' &&
    response !== null &&
    (response as { success?: unknown }).success === true
  );
}
