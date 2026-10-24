import { allLanguages } from '../i18n/utils';
import { defaultLang } from '../i18n/ui';
import { isCurrentPage, pageHref } from './nav';

/** The query parameter that carries the missing address to the 404 page of another language. */
export const missingPathParam = 'path';

/** The path of the 404 page in each language other than the default, e.g. "404" under /pt/. */
export const notFoundPath = '404';

/**
 * GitHub Pages serves one 404.html, in English, for every missing address. For an address under
 * another language's prefix, it sends the visitor on to that language's 404 page.
 */
export function notFoundRedirects(base: string): { prefix: string; href: string }[] {
  return allLanguages
    .filter((lang) => lang !== defaultLang)
    .map((lang) => ({
      prefix: pageHref(base, '', lang),
      href: pageHref(base, notFoundPath, lang),
    }));
}

/**
 * The address the visitor tried to open: the one carried over in the query, or the page's own.
 * Null when they opened a 404 page directly, so there is no missing address to show.
 */
export function missingPath(pathname: string, search: string, base: string): string | null {
  const carried = new URLSearchParams(search).get(missingPathParam);
  const isNotFoundPage = allLanguages.some((lang) =>
    isCurrentPage(pathname, base, notFoundPath, lang),
  );
  const path = carried ?? (isNotFoundPage ? null : pathname);
  if (path === null) return null;
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
