import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Test results from the CI run that built the site, shown on the /quality page.
 * CI writes them to `reports/` before the deploy build (see .github/workflows/ci.yml):
 * `unit.json` (Vitest), `coverage-summary.json` (V8 coverage), `e2e-<browser>.json` (Playwright),
 * `lighthouse-<shard>.json` (the Lighthouse CI manifest of each job that shared the pages) and
 * `links.json` (linkinator).
 */

export interface UnitResult {
  total: number;
  passed: number;
  failed: number;
}

export interface CoverageResult {
  lines: number;
  branches: number;
  functions: number;
  statements: number;
}

export interface E2eResult {
  browser: string;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
}

/** The lowest Lighthouse score of each category across the audited pages, from 0 to 100. */
export interface LighthouseResult {
  pages: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface LinksResult {
  checked: number;
  broken: number;
}

export interface CiRun {
  url: string;
  commit: string;
  commitUrl: string;
}

export interface QualityReport {
  unit?: UnitResult;
  coverage?: CoverageResult;
  e2e: E2eResult[];
  lighthouse?: LighthouseResult;
  links?: LinksResult;
  run?: CiRun;
}

export type Env = Record<string, string | undefined>;

/** Display names of the Playwright projects, in the order the /quality page lists them. */
const browserNames: Record<string, string> = {
  chromium: 'Chromium',
  firefox: 'Firefox',
  webkit: 'WebKit',
  'mobile-chrome': 'Chrome on Android (Pixel 7)',
  'mobile-safari': 'Safari on iPhone (iPhone 15)',
};
const browserOrder = Object.keys(browserNames);

/** Known projects first, in display order; unknown ones after them, alphabetically. */
function byBrowserOrder(a: string, b: string): number {
  const rank = (id: string) => {
    const index = browserOrder.indexOf(id);
    return index === -1 ? browserOrder.length : index;
  };
  return rank(a) - rank(b) || a.localeCompare(b);
}

function count(source: Record<string, unknown>, key: string, file: string): number {
  const value = source[key];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`${file}: expected "${key}" to be a non-negative number`);
  }
  return value;
}

function object(value: unknown, file: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) throw new Error(`${file}: expected an object`);
  return value as Record<string, unknown>;
}

/** Reads the totals from a Vitest JSON report. */
export function parseUnitReport(json: unknown): UnitResult {
  const report = object(json, 'unit.json');
  return {
    total: count(report, 'numTotalTests', 'unit.json'),
    passed: count(report, 'numPassedTests', 'unit.json'),
    failed: count(report, 'numFailedTests', 'unit.json'),
  };
}

/** Reads the total percentages from a V8 `coverage-summary.json`. */
export function parseCoverageSummary(json: unknown): CoverageResult {
  const total = object(object(json, 'coverage-summary.json').total, 'coverage-summary.json total');
  const pct = (metric: keyof CoverageResult) =>
    count(object(total[metric], `coverage ${metric}`), 'pct', `coverage ${metric}`);
  return {
    lines: pct('lines'),
    branches: pct('branches'),
    functions: pct('functions'),
    statements: pct('statements'),
  };
}

/** Reads the totals from a Playwright JSON report for one browser. */
export function parseE2eReport(browser: string, json: unknown): E2eResult {
  const file = `e2e-${browser}.json`;
  const stats = object(object(json, file).stats, `${file} stats`);
  return {
    browser: browserNames[browser] ?? browser,
    passed: count(stats, 'expected', file),
    failed: count(stats, 'unexpected', file),
    flaky: count(stats, 'flaky', file),
    skipped: count(stats, 'skipped', file),
  };
}

/**
 * Reads a Lighthouse CI manifest (one entry per run). Only the representative (median) run of each
 * page counts, and each category keeps its lowest score, so one slow page cannot hide behind the rest.
 */
export function parseLighthouseManifest(json: unknown): LighthouseResult {
  if (!Array.isArray(json)) throw new Error('lighthouse.json: expected a list of runs');
  const runs = json
    .map((run) => object(run, 'lighthouse.json run'))
    .filter((run) => run.isRepresentativeRun === true);
  if (runs.length === 0)
    throw new Error('lighthouse.json: expected at least one representative run');

  const lowest = (category: string) =>
    Math.min(
      ...runs.map((run) => {
        const score = count(
          object(run.summary, 'lighthouse.json summary'),
          category,
          'lighthouse.json',
        );
        if (score > 1) throw new Error(`lighthouse.json: expected "${category}" between 0 and 1`);
        return Math.round(score * 100);
      }),
    );
  return {
    pages: runs.length,
    performance: lowest('performance'),
    accessibility: lowest('accessibility'),
    bestPractices: lowest('best-practices'),
    seo: lowest('seo'),
  };
}

/** Counts the checked and broken links in a linkinator JSON result. Skipped links are left out. */
export function parseLinksReport(json: unknown): LinksResult {
  const links = object(json, 'links.json').links;
  if (!Array.isArray(links)) throw new Error('links.json: expected a list of links');
  const states = links.map((link) => object(link, 'links.json link').state);
  const broken = states.filter((state) => state === 'BROKEN').length;
  return { checked: states.filter((state) => state === 'OK').length + broken, broken };
}

/** Describes the GitHub Actions run that built the site, or undefined outside CI. */
export function ciRunFromEnv(env: Env): CiRun | undefined {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_SHA } = env;
  if (!GITHUB_SERVER_URL || !GITHUB_REPOSITORY || !GITHUB_RUN_ID || !GITHUB_SHA) return undefined;
  const repo = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}`;
  return {
    url: `${repo}/actions/runs/${GITHUB_RUN_ID}`,
    commit: GITHUB_SHA.slice(0, 7),
    commitUrl: `${repo}/commit/${GITHUB_SHA}`,
  };
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Loads the reports in `dir`. Missing reports are left out, so a local build still works.
 * With `REQUIRE_QUALITY_REPORT=true` (the deploy build) a missing report fails the build instead,
 * so the live page never silently loses its results.
 */
export function loadQualityReport(dir: string, env: Env = {}): QualityReport {
  const read = (name: string) => {
    const path = join(dir, name);
    return existsSync(path) ? readJson(path) : undefined;
  };
  const names = existsSync(dir) ? readdirSync(dir) : [];
  const unit = read('unit.json');
  const coverage = read('coverage-summary.json');
  const links = read('links.json');
  const e2eBrowsers = names
    .filter((name) => /^e2e-[\w-]+\.json$/.test(name))
    .map((name) => name.replace(/^e2e-|\.json$/g, ''))
    .sort(byBrowserOrder);
  // Several CI jobs share the Lighthouse pages; their manifests together cover the whole site.
  const lighthouseFiles = names.filter((name) => /^lighthouse(-\d+)?\.json$/.test(name)).sort();
  const lighthouse =
    lighthouseFiles.length === 0
      ? undefined
      : lighthouseFiles.flatMap((name) => {
          const runs = readJson(join(dir, name));
          if (!Array.isArray(runs)) throw new Error(`${name}: expected a list of runs`);
          return runs;
        });

  const report: QualityReport = {
    unit: unit === undefined ? undefined : parseUnitReport(unit),
    coverage: coverage === undefined ? undefined : parseCoverageSummary(coverage),
    e2e: e2eBrowsers.map((browser) =>
      parseE2eReport(browser, readJson(join(dir, `e2e-${browser}.json`))),
    ),
    lighthouse: lighthouse === undefined ? undefined : parseLighthouseManifest(lighthouse),
    links: links === undefined ? undefined : parseLinksReport(links),
    run: ciRunFromEnv(env),
  };

  if (env.REQUIRE_QUALITY_REPORT === 'true') {
    const missing = [
      !report.unit && 'unit.json',
      !report.coverage && 'coverage-summary.json',
      report.e2e.length === 0 && 'e2e-<browser>.json',
      !report.lighthouse && 'lighthouse-<shard>.json',
      !report.links && 'links.json',
      !report.run && 'GitHub Actions run details',
    ].filter(Boolean);
    if (missing.length > 0) {
      throw new Error(`Quality report incomplete in ${dir}: missing ${missing.join(', ')}`);
    }
  }

  return report;
}

/** Formats a percentage with at most one decimal, e.g. 95.24 → "95.2%", 100 → "100%". */
export function formatPercent(value: number): string {
  return `${Number(value.toFixed(1))}%`;
}

export interface CountLabels {
  passed: string;
  failed: string;
  flaky: string;
}

/** Describes test counts, e.g. "41 passed, 0 failed (1 passed on retry)". Retries are only mentioned when they happened. */
export function formatCounts(
  result: { passed: number; failed: number; flaky?: number },
  labels: CountLabels,
): string {
  const counts = `${result.passed} ${labels.passed}, ${result.failed} ${labels.failed}`;
  return result.flaky ? `${counts} (${result.flaky} ${labels.flaky})` : counts;
}
