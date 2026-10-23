import { describe, expect, it } from 'vitest';
import {
  contactSubmission,
  formAccessKey,
  formFields,
  isAccepted,
  messageMaxLength,
  validateContact,
} from '../../src/contact/form';
import { languages, ui } from '../../src/i18n/ui';

const valid = { name: 'Ana Silva', email: 'ana@example.com', message: 'Hello, Diogo.' };

describe('validateContact', () => {
  it('accepts a name, an email address and a message', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('asks for every field left empty, or holding only spaces', () => {
    expect(validateContact({ name: '', email: ' ', message: '\n' })).toEqual({
      name: 'contact.error.nameMissing',
      email: 'contact.error.emailMissing',
      message: 'contact.error.messageMissing',
    });
  });

  it('rejects an email address without an @ or a domain', () => {
    for (const email of ['ana', 'ana@', 'ana@example', '@example.com', 'ana silva@example.com']) {
      expect(validateContact({ ...valid, email }).email, email).toBe('contact.error.emailInvalid');
    }
  });

  it('accepts email addresses with subdomains, plus signs and spaces around them', () => {
    for (const email of ['ana+jobs@mail.example.co.uk', '  ana@example.pt  ']) {
      expect(validateContact({ ...valid, email }), email).toEqual({});
    }
  });

  it('rejects a message longer than the limit', () => {
    const message = 'a'.repeat(messageMaxLength + 1);

    expect(validateContact({ ...valid, message }).message).toBe('contact.error.messageTooLong');
    expect(validateContact({ ...valid, message: message.slice(1) })).toEqual({});
  });

  it('has every error message in every language', () => {
    const errors = validateContact({ name: '', email: 'x', message: '' });
    const keys = [...Object.values(errors), 'contact.error.emailMissing'] as const;
    for (const lang of Object.keys(languages) as (keyof typeof languages)[]) {
      for (const key of keys) expect(ui[lang][key], `${lang} ${key}`).toBeTruthy();
    }
  });
});

describe('contactSubmission', () => {
  it('sends the trimmed fields with the access key and a subject naming the sender', () => {
    const submission = contactSubmission(
      { name: ' Ana Silva ', email: ' ana@example.com', message: 'Hello, Diogo.\n' },
      false,
    );

    expect(submission).toEqual({
      access_key: formAccessKey,
      subject: 'Message from Ana Silva via the website',
      from_name: 'Diogo Martins website',
      ...valid,
      botcheck: false,
    });
  });

  it('passes the honeypot on, so the form service can drop the message as spam', () => {
    expect(contactSubmission(valid, true).botcheck).toBe(true);
  });

  it('sends every field of the form', () => {
    const submission = contactSubmission(valid, false);
    for (const field of formFields) expect(submission[field]).toBe(valid[field]);
  });
});

describe('formAccessKey', () => {
  // A placeholder key would let every message vanish without an error a visitor could see.
  it('is a real Web3Forms access key, not the placeholder', () => {
    expect(formAccessKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(formAccessKey).not.toBe('00000000-0000-0000-0000-000000000000');
  });
});

describe('isAccepted', () => {
  it('is true only when the form service answers with success', () => {
    expect(isAccepted({ success: true, message: 'Email sent successfully!' })).toBe(true);
    expect(isAccepted({ success: false, message: 'Invalid access key' })).toBe(false);
    expect(isAccepted({ success: 'true' })).toBe(false);
    expect(isAccepted(null)).toBe(false);
    expect(isAccepted('ok')).toBe(false);
  });
});
