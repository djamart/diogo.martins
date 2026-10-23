import { defaultLang, languages, languageTags, type Lang, type UiKey } from '../i18n/ui';

export interface NavItem {
  /** Path relative to the site base, without leading or trailing slash ("" is the home page). */
  path: string;
  labelKey: UiKey;
}

export const navItems: NavItem[] = [
  { path: '', labelKey: 'nav.home' },
  { path: 'about', labelKey: 'nav.about' },
  { path: 'experience', labelKey: 'nav.experience' },
  { path: 'projects', labelKey: 'nav.projects' },
  { path: 'quality', labelKey: 'nav.quality' },
  { path: 'contact', labelKey: 'nav.contact' },
];

function withTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

/**
 * Builds the href of a site page from the base path, in a language other than the default
 * under its prefix, e.g. ("/diogo.martins", "about", "pt") → "/diogo.martins/pt/about/".
 */
export function pageHref(base: string, path: string, lang: Lang = defaultLang): string {
  const root = withTrailingSlash(base) + (lang === defaultLang ? '' : `${lang}/`);
  return path === '' ? root : `${root}${path}/`;
}

/** True when `pathname` is the page at `path` in `lang`, ignoring a trailing slash or `.html` suffix. */
export function isCurrentPage(
  pathname: string,
  base: string,
  path: string,
  lang: Lang = defaultLang,
): boolean {
  const normalize = (value: string) => withTrailingSlash(value.replace(/\.html$/, ''));
  return normalize(pathname) === normalize(pageHref(base, path, lang));
}

/**
 * The path of the page at `pathname`, the same in every language: what `pageHref` takes,
 * e.g. "/diogo.martins/pt/about/" → "about".
 */
export function pagePath(pathname: string, base: string): string {
  const root = withTrailingSlash(base);
  const page = withTrailingSlash(pathname.replace(/\.html$/, ''));
  const segments = (page.startsWith(root) ? page.slice(root.length) : page)
    .split('/')
    .filter(Boolean);
  if (segments[0] in languages && segments[0] !== defaultLang) segments.shift();
  return segments.join('/');
}

export interface AlternateLink {
  /** A BCP 47 tag, or "x-default" for the page shown to visitors in any other language. */
  hreflang: string;
  href: string;
}

/** The page at `path` in every language, as absolute URLs, for `<link rel="alternate">`. */
export function alternateLinks(site: URL | string, base: string, path: string): AlternateLink[] {
  const href = (lang: Lang) => new URL(pageHref(base, path, lang), site).href;
  return [
    ...(Object.keys(languages) as Lang[]).map((lang) => ({
      hreflang: languageTags[lang],
      href: href(lang),
    })),
    { hreflang: 'x-default', href: href(defaultLang) },
  ];
}

/** Builds the href of a file at the site root, e.g. ("/diogo.martins", "cv.pdf") → "/diogo.martins/cv.pdf". */
export function fileHref(base: string, fileName: string): string {
  return `${withTrailingSlash(base)}${fileName}`;
}
