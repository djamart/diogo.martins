// Runs Lighthouse CI on the production build, with the pages and minimum scores in lighthouserc.json.
// Usage: npm run build && npm run test:lighthouse
// In CI, LIGHTHOUSE_SHARD="<n>/<total>" audits only every <total>-th page, starting from the <n>-th,
// so several jobs share the pages (see .github/workflows/ci.yml). Each page is still audited the
// same number of times against the same scores; only the job that audits it changes.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const config = JSON.parse(readFileSync('lighthouserc.json', 'utf8'));
const shard = process.env.LIGHTHOUSE_SHARD;

if (shard) {
  const match = /^(\d+)\/(\d+)$/.exec(shard);
  const [index, total] = match ? [Number(match[1]), Number(match[2])] : [0, 0];
  if (index < 1 || index > total) {
    throw new Error(`LIGHTHOUSE_SHARD must look like "2/3", got "${shard}"`);
  }
  config.ci.collect.url = config.ci.collect.url.filter((_, i) => i % total === index - 1);
}

const dir = mkdtempSync(join(tmpdir(), 'lighthouse-'));
const configFile = join(dir, 'lighthouserc.json');
writeFileSync(configFile, JSON.stringify(config));

const lhci = spawn('npx', ['lhci', 'autorun', `--config=${configFile}`, ...process.argv.slice(2)], {
  stdio: 'inherit',
});
lhci.on('exit', (code) => {
  rmSync(dir, { recursive: true, force: true });
  process.exit(code ?? 1);
});
