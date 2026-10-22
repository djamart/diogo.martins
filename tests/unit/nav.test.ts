import { describe, expect, it } from 'vitest';
import { fileHref, isCurrentPage, navItems, pageHref } from '../../src/utils/nav';
import { ui } from '../../src/i18n/ui';

describe('pageHref', () => {
  it('links the home page to the base path', () => {
    expect(pageHref('/diogo.martins/', '')).toBe('/diogo.martins/');
  });

  it('adds a trailing slash to the base path when missing', () => {
    expect(pageHref('/diogo.martins', 'about')).toBe('/diogo.martins/about/');
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
});

describe('navItems', () => {
  it('has a label for every item', () => {
    for (const item of navItems) {
      expect(ui.en[item.labelKey], item.path).toBeTruthy();
    }
  });
});
