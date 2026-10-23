import { describe, expect, it } from 'vitest';
import type { E2eResult, QualityReport } from '../../src/quality/report';
import {
  coverageMinimum,
  lighthouseMinimum,
  passRate,
  pointOnCircle,
  ringDash,
  summarize,
} from '../../src/quality/summary';
import lighthouseConfig from '../../lighthouserc.json';
import vitestConfig from '../../vitest.config';

const e2e = (browser: string, passed: number, failed = 0, flaky = 0): E2eResult => ({
  browser,
  passed,
  failed,
  flaky,
  skipped: 0,
});

const fullReport: QualityReport = {
  unit: { total: 90, passed: 88, failed: 2 },
  coverage: { lines: 100, branches: 98.9, functions: 100, statements: 99.5 },
  e2e: [e2e('Chromium', 35), e2e('Firefox', 34, 1), e2e('WebKit', 33, 0, 2)],
  links: { checked: 40, broken: 1 },
};

describe('summarize', () => {
  it('counts passing unit tests and browser runs, retries included', () => {
    const summary = summarize(fullReport);

    expect(summary.unitPassed).toBe(88);
    expect(summary.browserRuns).toEqual({ passed: 104, browsers: 3 });
  });

  it('picks the lowest coverage metric', () => {
    expect(summarize(fullReport).lowestCoverage).toEqual({ metric: 'branches', value: 98.9 });
  });

  it('adds up failed tests and broken links, but not tests that passed on retry', () => {
    expect(summarize(fullReport).failures).toBe(4);
  });

  it('leaves out what a build did not report', () => {
    expect(summarize({ e2e: [] })).toEqual({ failures: 0 });
  });
});

describe('passRate', () => {
  it('counts tests that passed on retry as passed', () => {
    expect(passRate(e2e('WebKit', 33, 0, 2))).toBe(100);
    expect(passRate(e2e('Firefox', 3, 1))).toBe(75);
  });

  it('is zero when no test ran', () => {
    expect(passRate(e2e('Chromium', 0))).toBe(0);
  });
});

describe('ringDash', () => {
  it('fills the share of the circumference given by the score', () => {
    const circumference = 2 * Math.PI * 10;
    expect(ringDash(50, 10)).toBe(`${(circumference / 2).toFixed(2)} ${circumference.toFixed(2)}`);
    expect(ringDash(100, 10)).toBe(`${circumference.toFixed(2)} ${circumference.toFixed(2)}`);
  });

  it('keeps the score between 0 and 100', () => {
    expect(ringDash(-5, 10).startsWith('0.00 ')).toBe(true);
    expect(ringDash(120, 10)).toBe(ringDash(100, 10));
  });
});

describe('pointOnCircle', () => {
  it('starts at the top and goes clockwise', () => {
    expect(pointOnCircle(0, 10, 50)).toEqual({ x: 50, y: 40 });
    expect(pointOnCircle(25, 10, 50)).toEqual({ x: 60, y: 50 });
    expect(pointOnCircle(50, 10, 50)).toEqual({ x: 50, y: 60 });
  });
});

describe('minimums drawn on the charts', () => {
  it('match the coverage thresholds the unit tests enforce', () => {
    const thresholds = vitestConfig.test?.coverage?.thresholds as Record<string, number>;
    for (const metric of ['lines', 'branches', 'functions', 'statements']) {
      expect(thresholds[metric], metric).toBe(coverageMinimum);
    }
  });

  it('match the Lighthouse scores CI enforces', () => {
    const { assertions } = lighthouseConfig.ci.assert;
    for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
      const assertion = assertions[`categories:${category}` as keyof typeof assertions];
      expect(assertion, category).toEqual(['error', { minScore: lighthouseMinimum / 100 }]);
    }
  });
});
