import type { UiKey } from '../i18n/ui';

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

/** Builds the href of a site page from the base path, e.g. ("/diogo.martins", "about") → "/diogo.martins/about/". */
export function pageHref(base: string, path: string): string {
  const root = withTrailingSlash(base);
  return path === '' ? root : `${root}${path}/`;
}

/** True when `pathname` is the page at `path`, ignoring a trailing slash or `.html` suffix. */
export function isCurrentPage(pathname: string, base: string, path: string): boolean {
  const normalize = (value: string) => withTrailingSlash(value.replace(/\.html$/, ''));
  return normalize(pathname) === normalize(pageHref(base, path));
}

/** Builds the href of a file at the site root, e.g. ("/diogo.martins", "cv.pdf") → "/diogo.martins/cv.pdf". */
export function fileHref(base: string, fileName: string): string {
  return `${withTrailingSlash(base)}${fileName}`;
}
