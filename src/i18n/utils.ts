import { defaultLang, languages, ui, type Lang, type UiKey } from './ui';

function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in languages;
}

/**
 * Returns the language of a URL from its first path segment after the base path,
 * falling back to the default language (which has no prefix).
 */
export function getLangFromUrl(url: URL, base = '/'): Lang {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const path = url.pathname.startsWith(normalizedBase)
    ? url.pathname.slice(normalizedBase.length)
    : url.pathname.replace(/^\//, '');
  const [segment] = path.split('/');
  return isLang(segment) ? segment : defaultLang;
}

/** Returns a translator for `lang` that falls back to the default language for missing keys. */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    const strings: Partial<Record<UiKey, string>> = ui[lang];
    return strings[key] ?? ui[defaultLang][key];
  };
}
