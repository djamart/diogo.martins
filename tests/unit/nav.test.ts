import { describe, expect, it } from 'vitest';
import {
  alternateLinks,
  fileHref,
  isCurrentPage,
  languageMenuHref,
  navItems,
  pageHref,
  pagePath,
} from '../../src/utils/nav';
import { languages, ui, type Lang } from '../../src/i18n/ui';

describe('pageHref', () => {
  it('links the home page to the base path', () => {
    expect(pageHref('/diogo.martins/', '')).toBe('/diogo.martins/');
  });

  it('adds a trailing slash to the base path when missing', () => {
    expect(pageHref('/diogo.martins', 'about')).toBe('/diogo.martins/about/');
  });

  it('puts Portuguese pages under /pt/', () => {
    expect(pageHref('/diogo.martins/', '', 'pt')).toBe('/diogo.martins/pt/');
    expect(pageHref('/diogo.martins', 'about', 'pt')).toBe('/diogo.martins/pt/about/');
  });

  it('gives English, the default language, no prefix', () => {
    expect(pageHref('/diogo.martins/', 'about', 'en')).toBe('/diogo.martins/about/');
  });
});

describe('pagePath', () => {
  it('returns the same path for a page in every language', () => {
    expect(pagePath('/diogo.martins/about/', '/diogo.martins/')).toBe('about');
    expect(pagePath('/diogo.martins/pt/about/', '/diogo.martins/')).toBe('about');
    expect(pagePath('/diogo.martins/pt/about.html', '/diogo.martins')).toBe('about');
  });

  it('returns an empty path for the home page in every language', () => {
    expect(pagePath('/diogo.martins/', '/diogo.martins/')).toBe('');
    expect(pagePath('/diogo.martins/pt/', '/diogo.martins/')).toBe('');
    expect(pagePath('/diogo.martins', '/diogo.martins/')).toBe('');
  });

  it('keeps a first segment that is not a language', () => {
    expect(pagePath('/projects/', '/')).toBe('projects');
  });
});

describe('alternateLinks', () => {
  const site = 'https://djamart.github.io';

  it('lists the page in every language as an absolute URL, with English as the default', () => {
    expect(alternateLinks(site, '/diogo.martins/', 'about')).toEqual([
      { hreflang: 'en', href: 'https://djamart.github.io/diogo.martins/about/' },
      { hreflang: 'pt-PT', href: 'https://djamart.github.io/diogo.martins/pt/about/' },
      { hreflang: 'x-default', href: 'https://djamart.github.io/diogo.martins/about/' },
    ]);
  });

  it('lists only the languages a page exists in', () => {
    expect(alternateLinks(site, '/diogo.martins/', 'blog/hello', ['en'])).toEqual([
      { hreflang: 'en', href: 'https://djamart.github.io/diogo.martins/blog/hello/' },
      { hreflang: 'x-default', href: 'https://djamart.github.io/diogo.martins/blog/hello/' },
    ]);
  });

  it('makes the only language the default for a page without an English version', () => {
    expect(alternateLinks(site, '/diogo.martins/', 'blog/ola', ['pt'])).toEqual([
      { hreflang: 'pt-PT', href: 'https://djamart.github.io/diogo.martins/pt/blog/ola/' },
      { hreflang: 'x-default', href: 'https://djamart.github.io/diogo.martins/pt/blog/ola/' },
    ]);
  });

  it('lists nothing for a page in no language', () => {
    expect(alternateLinks(site, '/diogo.martins/', 'blog/gone', [])).toEqual([]);
  });
});

describe('languageMenuHref', () => {
  it('leads to the same page in a language it exists in', () => {
    expect(languageMenuHref('/diogo.martins/', 'about', 'pt')).toBe('/diogo.martins/pt/about/');
    expect(languageMenuHref('/diogo.martins/', 'blog/hello', 'pt', ['en', 'pt'], 'blog')).toBe(
      '/diogo.martins/pt/blog/hello/',
    );
  });

  it('leads to the fallback page in a language the page is not in', () => {
    expect(languageMenuHref('/diogo.martins/', 'blog/hello', 'pt', ['en'], 'blog')).toBe(
      '/diogo.martins/pt/blog/',
    );
    expect(languageMenuHref('/diogo.martins/', 'blog/hello', 'pt', ['en'])).toBe(
      '/diogo.martins/pt/',
    );
  });
});

describe('fileHref', () => {
  it('places a file at the site root, with or without a trailing slash on the base', () => {
    expect(fileHref('/diogo.martins', 'cv.pdf')).toBe('/diogo.martins/cv.pdf');
    expect(fileHref('/diogo.martins/', 'cv.pdf')).toBe('/diogo.martins/cv.pdf');
  });
});

describe('isCurrentPage', () => {
  it('matches a page with or without a trailing slash', () => {
    expect(isCurrentPage('/diogo.martins/about', '/diogo.martins/', 'about')).toBe(true);
    expect(isCurrentPage('/diogo.martins/about/', '/diogo.martins/', 'about')).toBe(true);
  });

  it('matches a page served as .html', () => {
    expect(isCurrentPage('/diogo.martins/about.html', '/diogo.martins/', 'about')).toBe(true);
  });

  it('does not mark home as current on another page', () => {
    expect(isCurrentPage('/diogo.martins/about/', '/diogo.martins/', '')).toBe(false);
  });

  it('marks home as current on the site root', () => {
    expect(isCurrentPage('/diogo.martins', '/diogo.martins/', '')).toBe(true);
  });

  it('matches a page only in its own language', () => {
    expect(isCurrentPage('/diogo.martins/pt/about/', '/diogo.martins/', 'about', 'pt')).toBe(true);
    expect(isCurrentPage('/diogo.martins/pt/about/', '/diogo.martins/', 'about')).toBe(false);
    expect(isCurrentPage('/diogo.martins/pt/', '/diogo.martins/', '', 'pt')).toBe(true);
  });
});

describe('navItems', () => {
  it('has a label for every item in every language', () => {
    for (const lang of Object.keys(languages) as Lang[]) {
      for (const item of navItems) {
        expect(ui[lang][item.labelKey], `${lang} ${item.path}`).toBeTruthy();
      }
    }
  });
});
