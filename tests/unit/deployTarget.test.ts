import { describe, expect, it } from 'vitest';
import { deployTarget, githubPages } from '../../src/utils/deployTarget';

describe('deployTarget', () => {
  it('builds for GitHub Pages under /diogo.martins/ by default', () => {
    expect(deployTarget({})).toEqual(githubPages);
    expect(deployTarget({ CI: 'true', GITHUB_ACTIONS: 'true' })).toEqual({
      site: 'https://djamart.github.io',
      base: '/diogo.martins',
    });
  });

  it('builds for the root of the production domain on Vercel', () => {
    expect(
      deployTarget({
        VERCEL: '1',
        VERCEL_PROJECT_PRODUCTION_URL: 'diogo-martins.vercel.app',
        VERCEL_URL: 'diogo-martins-abc123.vercel.app',
      }),
    ).toEqual({ site: 'https://diogo-martins.vercel.app', base: '/' });
  });

  it('falls back to the deployment domain on Vercel when there is no production domain', () => {
    expect(deployTarget({ VERCEL: '1', VERCEL_URL: 'preview-abc.vercel.app' })).toEqual({
      site: 'https://preview-abc.vercel.app',
      base: '/',
    });
  });

  it('keeps the GitHub Pages target when Vercel gives no domain', () => {
    expect(deployTarget({ VERCEL: '1' })).toEqual(githubPages);
  });

  it('lets SITE_URL and BASE_PATH override any host', () => {
    expect(deployTarget({ SITE_URL: 'https://diogomartins.dev', BASE_PATH: '/' })).toEqual({
      site: 'https://diogomartins.dev',
      base: '/',
    });
    expect(
      deployTarget({
        VERCEL: '1',
        VERCEL_PROJECT_PRODUCTION_URL: 'diogo-martins.vercel.app',
        SITE_URL: 'https://diogomartins.dev',
      }),
    ).toEqual({ site: 'https://diogomartins.dev', base: '/' });
  });
});
