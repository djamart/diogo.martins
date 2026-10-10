import { describe, expect, it } from 'vitest';
import { getLangFromUrl, useTranslations } from '../../src/i18n/utils';
import { defaultLang, ui } from '../../src/i18n/ui';

describe('getLangFromUrl', () => {
  it('returns the default language for the site root', () => {
    expect(getLangFromUrl(new URL('https://example.com/diogo.martins/'), '/diogo.martins/')).toBe(
      defaultLang,
    );
  });

  it('returns the default language when the first segment is not a known locale', () => {
    expect(getLangFromUrl(new URL('https://example.com/xx/about'), '/')).toBe(defaultLang);
  });

  it('detects a known locale prefix after the base path', () => {
    expect(getLangFromUrl(new URL('https://example.com/diogo.martins/en/'), '/diogo.martins')).toBe(
      'en',
    );
  });

  it('ignores a base path that does not match the URL', () => {
    expect(getLangFromUrl(new URL('https://example.com/en/about'), '/other/')).toBe('en');
  });
});

describe('useTranslations', () => {
  it('returns the string for the requested language', () => {
    const t = useTranslations('en');
    expect(t('home.role')).toBe(ui.en['home.role']);
  });

  it('has a non-empty value for every key in the default language', () => {
    for (const [key, value] of Object.entries(ui[defaultLang])) {
      expect(value, key).not.toBe('');
    }
  });
});
