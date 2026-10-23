// Renders the visual baselines (e2e/__screenshots__/) in the same Playwright image CI uses, so
// fonts and anti-aliasing match pixel for pixel whatever machine runs it. Needs Docker.
// Usage: npm run test:visual:update
// Review the changed PNGs in the diff before committing: they become the approved look of the site.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const version = lock.packages['node_modules/@playwright/test'].version;
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

// node_modules lives in its own volume, so the Linux install never replaces the one on this machine.
const command = [
  'npm ci --no-audit --no-fund',
  'npm run build',
  'npx playwright test e2e/visual.spec.ts --project=chromium --project=mobile-chrome --update-snapshots=changed',
].join(' && ');

// Files written into the project belong to the user running this, not to root (Linux and macOS).
const user = process.getuid
  ? ['--user', `${process.getuid()}:${process.getgid()}`, '--env', 'HOME=/tmp']
  : [];

const { status } = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--ipc=host',
    ...user,
    '--volume',
    `${process.cwd()}:/work`,
    '--volume',
    '/work/node_modules',
    '--workdir',
    '/work',
    image,
    'bash',
    '-c',
    command,
  ],
  { stdio: 'inherit' },
);
process.exit(status ?? 1);
