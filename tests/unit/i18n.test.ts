import { describe, expect, it } from 'vitest';
import {
  getLangFromUrl,
  localeStaticPaths,
  allLanguages,
  languageCode,
  useTranslations,
} from '../../src/i18n/utils';
import { defaultLang, languages, languageTags, ui, type Lang } from '../../src/i18n/ui';

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

  it('detects Portuguese under /pt/', () => {
    expect(
      getLangFromUrl(new URL('https://example.com/diogo.martins/pt/about/'), '/diogo.martins/'),
    ).toBe('pt');
  });

  it('ignores a base path that does not match the URL', () => {
    expect(getLangFromUrl(new URL('https://example.com/en/about'), '/other/')).toBe('en');
  });
});

describe('useTranslations', () => {
  it('returns the string for the requested language', () => {
    const t = useTranslations('en');
    expect(t('nav.about')).toBe(ui.en['nav.about']);
  });

  it('returns Portuguese strings for Portuguese', () => {
    expect(useTranslations('pt')('nav.contact')).toBe('Contacto');
  });

  it('has a non-empty value for every key in every language', () => {
    for (const lang of Object.keys(languages) as Lang[]) {
      expect(Object.keys(ui[lang]).sort(), lang).toEqual(Object.keys(ui[defaultLang]).sort());
      for (const [key, value] of Object.entries(ui[lang])) {
        expect(value, `${lang} ${key}`).not.toBe('');
      }
    }
  });
});

describe('languages', () => {
  it('tags Portuguese as European Portuguese, not Brazilian', () => {
    expect(languageTags.pt).toBe('pt-PT');
  });

  it('lists every language in the language menu, English first', () => {
    expect(allLanguages).toEqual(['en', 'pt']);
  });

  it('shows each language on the button by its short code', () => {
    expect(languageCode('en')).toBe('EN');
    expect(languageCode('pt')).toBe('PT');
  });

  it('builds every page at the root for English and under /pt/ for Portuguese', () => {
    expect(localeStaticPaths()).toEqual([
      { params: { locale: undefined } },
      { params: { locale: 'pt' } },
    ]);
  });
});
