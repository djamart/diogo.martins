import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ciRunFromEnv,
  formatCounts,
  formatPercent,
  loadQualityReport,
  parseCoverageSummary,
  parseE2eReport,
  parseLighthouseManifest,
  parseLinksReport,
  parseUnitReport,
} from '../../src/quality/report';

const unitJson = { numTotalTests: 42, numPassedTests: 41, numFailedTests: 1, success: false };
const coverageJson = {
  total: {
    lines: { pct: 97.31 },
    branches: { pct: 90 },
    functions: { pct: 100 },
    statements: { pct: 96.5 },
  },
};
const e2eJson = (expected: number, flaky = 0) => ({
  stats: { expected, unexpected: 0, flaky, skipped: 0, duration: 1234 },
});
const lighthouseRun = (url: string, performance: number, isRepresentativeRun = true) => ({
  url,
  isRepresentativeRun,
  summary: { performance, accessibility: 1, 'best-practices': 0.96, seo: 1 },
});
const lighthouseJson = [
  lighthouseRun('/about/', 0.99),
  lighthouseRun('/', 0.97),
  lighthouseRun('/', 0.5, false),
];
const linksJson = {
  passed: false,
  links: [
    { url: '/', state: 'OK', status: 200 },
    { url: '/cv.pdf', state: 'OK', status: 200 },
    { url: '/missing/', state: 'BROKEN', status: 404 },
    { url: 'mailto:someone@example.com', state: 'SKIPPED', status: 0 },
  ],
};
const githubEnv = {
  GITHUB_SERVER_URL: 'https://github.com',
  GITHUB_REPOSITORY: 'djamart/diogo.martins',
  GITHUB_RUN_ID: '123456',
  GITHUB_SHA: 'dde877c1c35bf3fc2754b453a8eb041ca81da272',
};
const labels = { passed: 'passed', failed: 'failed', flaky: 'passed on retry' };

describe('parseUnitReport', () => {
  it('reads the totals from a Vitest JSON report', () => {
    expect(parseUnitReport(unitJson)).toEqual({ total: 42, passed: 41, failed: 1 });
  });

  it('rejects a report without test counts', () => {
    expect(() => parseUnitReport({ numTotalTests: 3 })).toThrow(/"numPassedTests"/);
    expect(() => parseUnitReport(null)).toThrow(/expected an object/);
  });

  it('rejects a negative count', () => {
    expect(() => parseUnitReport({ ...unitJson, numFailedTests: -1 })).toThrow(/non-negative/);
  });
});

describe('parseCoverageSummary', () => {
  it('reads the total percentage of each metric', () => {
    expect(parseCoverageSummary(coverageJson)).toEqual({
      lines: 97.31,
      branches: 90,
      functions: 100,
      statements: 96.5,
    });
  });

  it('rejects a summary with a missing metric', () => {
    expect(() => parseCoverageSummary({ total: { lines: { pct: 90 } } })).toThrow(/branches/);
  });
});

describe('parseE2eReport', () => {
  it('reads the totals of a Playwright JSON report and names the browser', () => {
    expect(parseE2eReport('webkit', e2eJson(40, 2))).toEqual({
      browser: 'WebKit',
      passed: 40,
      failed: 0,
      flaky: 2,
      skipped: 0,
    });
  });

  it('names the phone projects after the device they emulate', () => {
    expect(parseE2eReport('mobile-chrome', e2eJson(1)).browser).toBe('Chrome on Android (Pixel 7)');
    expect(parseE2eReport('mobile-safari', e2eJson(1)).browser).toBe(
      'Safari on iPhone (iPhone 15)',
    );
  });

  it('keeps an unknown browser id as its name', () => {
    expect(parseE2eReport('tablet-edge', e2eJson(1)).browser).toBe('tablet-edge');
  });

  it('rejects a report without stats', () => {
    expect(() => parseE2eReport('chromium', {})).toThrow(/e2e-chromium\.json stats/);
  });
});

describe('parseLighthouseManifest', () => {
  it('keeps the lowest score of each category across the median runs, as a whole number', () => {
    expect(parseLighthouseManifest(lighthouseJson)).toEqual({
      pages: 2,
      performance: 97,
      accessibility: 100,
      bestPractices: 96,
      seo: 100,
    });
  });

  it('rejects a manifest without runs to report', () => {
    expect(() => parseLighthouseManifest({})).toThrow(/expected a list of runs/);
    expect(() => parseLighthouseManifest([lighthouseRun('/', 1, false)])).toThrow(
      /at least one representative run/,
    );
  });

  it('rejects a score outside 0 to 1', () => {
    expect(() => parseLighthouseManifest([lighthouseRun('/', 95)])).toThrow(
      /"performance" between 0 and 1/,
    );
    expect(() =>
      parseLighthouseManifest([{ isRepresentativeRun: true, summary: { performance: 1 } }]),
    ).toThrow(/"accessibility"/);
  });
});

describe('parseLinksReport', () => {
  it('counts checked and broken links, leaving out skipped ones', () => {
    expect(parseLinksReport(linksJson)).toEqual({ checked: 3, broken: 1 });
  });

  it('rejects a result without links', () => {
    expect(() => parseLinksReport({ passed: true })).toThrow(/expected a list of links/);
  });
});

describe('ciRunFromEnv', () => {
  it('links to the run and the commit that built the site', () => {
    expect(ciRunFromEnv(githubEnv)).toEqual({
      url: 'https://github.com/djamart/diogo.martins/actions/runs/123456',
      commit: 'dde877c',
      commitUrl:
        'https://github.com/djamart/diogo.martins/commit/dde877c1c35bf3fc2754b453a8eb041ca81da272',
    });
  });

  it('is undefined outside GitHub Actions', () => {
    expect(ciRunFromEnv({})).toBeUndefined();
    expect(ciRunFromEnv({ ...githubEnv, GITHUB_RUN_ID: '' })).toBeUndefined();
  });
});

describe('formatPercent', () => {
  it('keeps at most one decimal and drops a trailing zero', () => {
    expect(formatPercent(97.31)).toBe('97.3%');
    expect(formatPercent(100)).toBe('100%');
    expect(formatPercent(90.04)).toBe('90%');
  });
});

describe('formatCounts', () => {
  it('shows passed and failed tests', () => {
    expect(formatCounts({ passed: 41, failed: 1 }, labels)).toBe('41 passed, 1 failed');
  });

  it('mentions retries only when a test needed one', () => {
    expect(formatCounts({ passed: 40, failed: 0, flaky: 0 }, labels)).toBe('40 passed, 0 failed');
    expect(formatCounts({ passed: 40, failed: 0, flaky: 2 }, labels)).toBe(
      '40 passed, 0 failed (2 passed on retry)',
    );
  });
});

describe('loadQualityReport', () => {
  let dir: string;
  const write = (name: string, json: unknown) =>
    writeFileSync(join(dir, name), JSON.stringify(json));

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'quality-report-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('loads every report in the folder, with desktop browsers before phones', () => {
    write('unit.json', unitJson);
    write('coverage-summary.json', coverageJson);
    write('e2e-mobile-safari.json', e2eJson(5));
    write('e2e-webkit.json', e2eJson(3));
    write('e2e-tablet-edge.json', e2eJson(7));
    write('e2e-chromium.json', e2eJson(1));
    write('e2e-mobile-chrome.json', e2eJson(4));
    write('e2e-firefox.json', e2eJson(2));
    write('e2e-a-new-browser.json', e2eJson(6));
    write('lighthouse.json', lighthouseJson);
    write('links.json', linksJson);
    write('notes.json', {});

    const report = loadQualityReport(dir, githubEnv);

    expect(report.unit?.total).toBe(42);
    expect(report.coverage?.lines).toBe(97.31);
    expect(report.e2e.map((result) => [result.browser, result.passed])).toEqual([
      ['Chromium', 1],
      ['Firefox', 2],
      ['WebKit', 3],
      ['Chrome on Android (Pixel 7)', 4],
      ['Safari on iPhone (iPhone 15)', 5],
      ['a-new-browser', 6],
      ['tablet-edge', 7],
    ]);
    expect(report.lighthouse?.performance).toBe(97);
    expect(report.links?.broken).toBe(1);
    expect(report.run?.commit).toBe('dde877c');
  });

  it('leaves out missing reports so a local build still works', () => {
    expect(loadQualityReport(join(dir, 'missing'))).toEqual({
      unit: undefined,
      coverage: undefined,
      e2e: [],
      lighthouse: undefined,
      links: undefined,
      run: undefined,
    });
  });

  it('joins the Lighthouse results of the jobs that shared the pages', () => {
    write('lighthouse-1.json', [lighthouseRun('/', 0.99), lighthouseRun('/', 0.4, false)]);
    write('lighthouse-2.json', [lighthouseRun('/about/', 0.96)]);
    write('lighthouse-3.json', [lighthouseRun('/pt/', 0.98)]);

    const report = loadQualityReport(dir);

    expect(report.lighthouse?.pages).toBe(3);
    expect(report.lighthouse?.performance).toBe(96);
  });

  it('rejects a Lighthouse result that is not a list of runs', () => {
    write('lighthouse-1.json', [lighthouseRun('/', 0.99)]);
    write('lighthouse-2.json', { runs: [] });

    expect(() => loadQualityReport(dir)).toThrow('lighthouse-2.json: expected a list of runs');
  });

  it('fails the deploy build when a report is missing', () => {
    write('unit.json', unitJson);

    expect(() => loadQualityReport(dir, { ...githubEnv, REQUIRE_QUALITY_REPORT: 'true' })).toThrow(
      /missing coverage-summary\.json, e2e-<browser>\.json, lighthouse-<shard>\.json, links\.json$/,
    );
  });

  it('passes the deploy build when every report is there', () => {
    write('unit.json', unitJson);
    write('coverage-summary.json', coverageJson);
    write('e2e-chromium.json', e2eJson(1));
    write('lighthouse-1.json', lighthouseJson);
    write('links.json', linksJson);

    expect(() =>
      loadQualityReport(dir, { ...githubEnv, REQUIRE_QUALITY_REPORT: 'true' }),
    ).not.toThrow();
  });

  it('fails the deploy build outside GitHub Actions', () => {
    expect(() => loadQualityReport(dir, { REQUIRE_QUALITY_REPORT: 'true' })).toThrow(
      /GitHub Actions run details/,
    );
  });
});
