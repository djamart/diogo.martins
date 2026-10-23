import type { CoverageResult, E2eResult, QualityReport } from './report';

/** The coverage the unit tests must reach (vitest.config.ts), drawn as a line on the coverage bars. */
export const coverageMinimum = 80;

/** The Lighthouse score every category must reach (lighthouserc.json), marked on each gauge. */
export const lighthouseMinimum = 95;

export interface BuildSummary {
  unitPassed?: number;
  /** Browser test runs that passed, retries included, and how many browsers and phones ran them. */
  browserRuns?: { passed: number; browsers: number };
  lowestCoverage?: { metric: keyof CoverageResult; value: number };
  /** Failed unit and browser tests plus broken links. Tests that passed on retry are not failures. */
  failures: number;
}

/** The headline numbers of a build, for the strip at the top of the /quality page. */
export function summarize(report: QualityReport): BuildSummary {
  const summary: BuildSummary = {
    failures:
      (report.unit?.failed ?? 0) +
      report.e2e.reduce((sum, result) => sum + result.failed, 0) +
      (report.links?.broken ?? 0),
  };
  if (report.unit) summary.unitPassed = report.unit.passed;
  if (report.e2e.length > 0) {
    summary.browserRuns = {
      passed: report.e2e.reduce((sum, result) => sum + result.passed + result.flaky, 0),
      browsers: report.e2e.length,
    };
  }
  if (report.coverage) {
    const coverage = report.coverage;
    const metrics = Object.keys(coverage) as (keyof CoverageResult)[];
    const metric = metrics.reduce((low, next) => (coverage[next] < coverage[low] ? next : low));
    summary.lowestCoverage = { metric, value: coverage[metric] };
  }
  return summary;
}

/** The share of a browser's tests that passed, retries included, from 0 to 100. */
export function passRate(result: E2eResult): number {
  const ran = result.passed + result.flaky + result.failed;
  return ran === 0 ? 0 : ((result.passed + result.flaky) / ran) * 100;
}

/** The SVG `stroke-dasharray` that fills `score` percent of a circle's circumference. */
export function ringDash(score: number, radius: number): string {
  const circumference = 2 * Math.PI * radius;
  const filled = (circumference * Math.min(Math.max(score, 0), 100)) / 100;
  return `${filled.toFixed(2)} ${circumference.toFixed(2)}`;
}

/** A point on a circle of `radius` around (`center`, `center`), `percent` of the way round from the top, clockwise. */
export function pointOnCircle(
  percent: number,
  radius: number,
  center: number,
): { x: number; y: number } {
  const angle = (percent / 100) * 2 * Math.PI - Math.PI / 2;
  return {
    x: Number((center + radius * Math.cos(angle)).toFixed(2)),
    y: Number((center + radius * Math.sin(angle)).toFixed(2)),
  };
}
