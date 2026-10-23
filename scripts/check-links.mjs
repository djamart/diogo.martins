// Checks every link on the production build: pages, anchors, downloads and external sites.
// Runs `astro preview` so links resolve under the base path exactly as on GitHub Pages.
// Usage: npm run build && npm run test:links
// In CI, LINKS_REPORT_FILE saves the results for the /quality page (see .github/workflows/ci.yml),
// and LINKS_GIT_REF checks links to files in this repository at the commit under test, not on main.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { check } from 'linkinator';

const port = 4323;
const siteUrl = `http://localhost:${port}/diogo.martins/`;
const liveSiteUrl = 'https://djamart.github.io/diogo.martins/';
const repoFiles = 'https://github.com/djamart/diogo.martins/blob/main/';
const gitRef = process.env.LINKS_GIT_REF;

const server = spawn('npx', ['astro', 'preview', '--port', String(port), '--ignore-lock'], {
  stdio: 'ignore',
});

async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(siteUrl)).ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`The preview server did not start at ${siteUrl}`);
}

try {
  await waitForServer();
  const result = await check({
    path: siteUrl,
    recurse: true,
    checkFragments: true,
    retry: true,
    retryErrors: true,
    retryErrorsCount: 3,
    timeout: 15_000,
    urlRewriteExpressions: [
      // The hreflang alternates are absolute URLs of the live site; check them on this build,
      // where a page added by a pull request already exists.
      { pattern: new RegExp(`^${liveSiteUrl}`), replacement: siteUrl },
      // A pull request that adds a skill links to a file that is not on main yet.
      ...(gitRef
        ? [
            {
              pattern: new RegExp(`^${repoFiles}`),
              replacement: repoFiles.replace('/main/', `/${gitRef}/`),
            },
          ]
        : []),
    ],
    linksToSkip: [
      // LinkedIn answers every automated request with status 999; E2E tests check the URL instead.
      '^https://(www\\.)?linkedin\\.com/',
    ],
  });

  if (process.env.LINKS_REPORT_FILE) {
    mkdirSync(dirname(process.env.LINKS_REPORT_FILE), { recursive: true });
    writeFileSync(process.env.LINKS_REPORT_FILE, JSON.stringify(result, null, 2));
  }

  const broken = result.links.filter((link) => link.state === 'BROKEN');
  for (const link of broken) {
    console.error(`BROKEN ${link.status} ${link.url}\n  on ${link.parent}`);
  }
  const checked = result.links.filter((link) => link.state === 'OK').length;
  console.log(`${checked} links OK, ${broken.length} broken.`);
  process.exitCode = result.passed ? 0 : 1;
} finally {
  server.kill();
}
