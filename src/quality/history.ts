import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Lang } from '../i18n/ui';
import type { QualityReport } from './report';
import { summarize } from './summary';

/**
 * The headline numbers of past deploys, for the trend on the /quality page.
 * The site keeps its own history: before the deploy build, CI downloads the `quality-history.json`
 * the live site publishes into `reports/history.json` (see .github/workflows/ci.yml); the build
 * adds this run and publishes the result again (src/pages/quality-history.json.ts).
 */

export interface HistoryEntry {
  /** When the deploy was built, as an ISO date and time. */
  date: string;
  /** The short commit hash. */
  commit: string;
  /** Unit tests plus browser test runs that passed. */
  tests: number;
  /** The lowest of the four coverage percentages. */
  coverage: number;
  /** The lowest Lighthouse score of any category on any page. */
  lighthouse: number;
}

/** How many deploys the trend shows and the history keeps. */
export const historyLength = 12;

function entry(value: unknown, index: number): HistoryEntry {
  const where = `history.json entry ${index}`;
  if (typeof value !== 'object' || value === null) throw new Error(`${where}: expected an object`);
  const { date, commit, tests, coverage, lighthouse } = value as Record<string, unknown>;
  if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) {
    throw new Error(`${where}: expected "date" to be an ISO date`);
  }
  if (typeof commit !== 'string' || commit === '') {
    throw new Error(`${where}: expected "commit" to be a commit hash`);
  }
  for (const [key, number] of Object.entries({ tests, coverage, lighthouse })) {
    if (typeof number !== 'number' || !Number.isFinite(number) || number < 0) {
      throw new Error(`${where}: expected "${key}" to be a non-negative number`);
    }
  }
  return { date, commit, tests, coverage, lighthouse } as HistoryEntry;
}

/** Reads a history file, oldest deploy first. */
export function parseHistory(json: unknown): HistoryEntry[] {
  if (!Array.isArray(json)) throw new Error('history.json: expected a list of deploys');
  return json.map(entry);
}

/** This build as a history entry, or undefined unless it has every number the trend shows. */
export function entryFromReport(report: QualityReport, date: Date): HistoryEntry | undefined {
  const summary = summarize(report);
  if (
    !report.run ||
    !report.lighthouse ||
    !summary.lowestCoverage ||
    summary.unitPassed === undefined ||
    !summary.browserRuns
  ) {
    return undefined;
  }
  return {
    date: date.toISOString(),
    commit: report.run.commit,
    tests: summary.unitPassed + summary.browserRuns.passed,
    coverage: summary.lowestCoverage.value,
    lighthouse: Math.min(
      report.lighthouse.performance,
      report.lighthouse.accessibility,
      report.lighthouse.bestPractices,
      report.lighthouse.seo,
    ),
  };
}

/** Adds a deploy and keeps the latest `historyLength`. A re-run of the same commit replaces it. */
export function addEntry(history: HistoryEntry[], latest: HistoryEntry): HistoryEntry[] {
  return [...history.filter((past) => past.commit !== latest.commit), latest].slice(-historyLength);
}

/** The history the live site had before this build, with this build added when it is a deploy. */
export function loadHistory(dir: string, report: QualityReport, now = new Date()): HistoryEntry[] {
  const path = join(dir, 'history.json');
  const past = existsSync(path) ? parseHistory(JSON.parse(readFileSync(path, 'utf8'))) : [];
  const latest = entryFromReport(report, now);
  return latest ? addEntry(past, latest) : past;
}

export interface ChartArea {
  width: number;
  height: number;
  min: number;
  max: number;
}

/**
 * The SVG `points` of a line chart: values spread evenly from left to right, `min` at the bottom
 * and `max` at the top. Values outside that range are drawn at its edge.
 */
export function linePoints(values: number[], { width, height, min, max }: ChartArea): string {
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return values
    .map((value, index) => {
      const clamped = Math.min(Math.max(value, min), max);
      const y = height - ((clamped - min) / (max - min)) * height;
      return `${Number((index * step).toFixed(2))},${Number(y.toFixed(2))}`;
    })
    .join(' ');
}

/** A round top for a chart axis that starts at zero: 237 → 250, 1240 → 1500. */
export function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((n) => n * magnitude >= value)!;
  return step * magnitude;
}

const dateLocales: Record<Lang, string> = { en: 'en-GB', pt: 'pt-PT' };

/** A deploy date on the chart axis, e.g. "23 Oct" or "23/10". */
export function formatDeployDate(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(dateLocales[lang], {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(date));
}
