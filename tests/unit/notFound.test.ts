import { describe, expect, it } from 'vitest';
import { missingPath, missingPathParam, notFoundRedirects } from '../../src/utils/notFound';

describe('notFoundRedirects', () => {
  it('sends missing Portuguese addresses to the Portuguese 404 page', () => {
    expect(notFoundRedirects('/diogo.martins')).toEqual([
      { prefix: '/diogo.martins/pt/', href: '/diogo.martins/pt/404/' },
    ]);
  });

  it('leaves English addresses on the English 404 page', () => {
    const prefixes = notFoundRedirects('/diogo.martins/').map((redirect) => redirect.prefix);

    expect(prefixes).not.toContain('/diogo.martins/');
  });
});

describe('missingPath', () => {
  const base = '/diogo.martins';

  it('names the address the visitor opened', () => {
    expect(missingPath('/diogo.martins/old-page', '', base)).toBe('/diogo.martins/old-page');
  });

  it('names the address carried over from the English 404 page', () => {
    const search = `?${missingPathParam}=${encodeURIComponent('/diogo.martins/pt/antigo')}`;

    expect(missingPath('/diogo.martins/pt/404/', search, base)).toBe('/diogo.martins/pt/antigo');
  });

  it('decodes accents and spaces so the address reads as typed', () => {
    expect(missingPath('/diogo.martins/p%C3%A1gina%20velha', '', base)).toBe(
      '/diogo.martins/página velha',
    );
  });

  it('keeps an address that is not valid percent-encoding as it is', () => {
    expect(missingPath('/diogo.martins/100%', '', base)).toBe('/diogo.martins/100%');
  });

  it('names nothing when a 404 page is opened directly', () => {
    expect(missingPath('/diogo.martins/pt/404/', '', base)).toBeNull();
    expect(missingPath('/diogo.martins/404.html', '', base)).toBeNull();
  });
});
