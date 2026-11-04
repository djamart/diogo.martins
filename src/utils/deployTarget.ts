/**
 * Where the build will be served, read from the environment at build time by astro.config.mjs.
 *
 * - GitHub Pages (the default): a project site under /diogo.martins/ on djamart.github.io.
 * - Vercel: the site sits at the root of its domain. Vercel sets VERCEL=1 on every build and
 *   VERCEL_PROJECT_PRODUCTION_URL to the production domain, without the scheme.
 * - SITE_URL and BASE_PATH override either, e.g. for a custom domain.
 */
export interface DeployTarget {
  /** The origin pages are served from, used for canonical, hreflang and RSS links. */
  site: string;
  /** The path every page lives under, starting with a slash. */
  base: string;
}

export const githubPages: DeployTarget = {
  site: 'https://djamart.github.io',
  base: '/diogo.martins',
};

type Env = Record<string, string | undefined>;

/** The site and base path the build should use, given its environment variables. */
export function deployTarget(env: Env): DeployTarget {
  const onVercel = env.VERCEL === '1';
  const vercelDomain = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  const defaults: DeployTarget =
    onVercel && vercelDomain ? { site: `https://${vercelDomain}`, base: '/' } : githubPages;
  return {
    site: env.SITE_URL || defaults.site,
    base: env.BASE_PATH || defaults.base,
  };
}
