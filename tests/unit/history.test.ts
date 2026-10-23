import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  addEntry,
  entryFromReport,
  formatDeployDate,
  historyLength,
  linePoints,
  loadHistory,
  niceMax,
  parseHistory,
  type HistoryEntry,
} from '../../src/quality/history';
import type { QualityReport } from '../../src/quality/report';

const deploy = (commit: string, tests = 200): HistoryEntry => ({
  date: '2026-10-23T10:00:00.000Z',
  commit,
  tests,
  coverage: 95.5,
  lighthouse: 98,
});

const deployReport: QualityReport = {
  unit: { total: 170, passed: 168, failed: 2 },
  coverage: { lines: 96, branches: 94.2, functions: 97, statements: 96 },
  e2e: [
    { browser: 'Chromium', passed: 100, failed: 0, flaky: 2, skipped: 0 },
    { browser: 'Firefox', passed: 90, failed: 1, flaky: 0, skipped: 0 },
  ],
  lighthouse: { pages: 10, performance: 97, accessibility: 100, bestPractices: 96, seo: 100 },
  links: { checked: 40, broken: 0 },
  run: { url: 'https://example.test/run', commit: 'abc1234', commitUrl: 'https://example.test/c' },
};

const now = new Date('2026-10-23T17:00:00Z');

describe('entryFromReport', () => {
  it('records passing tests, the lowest coverage and the lowest Lighthouse score', () => {
    expect(entryFromReport(deployReport, now)).toEqual({
      date: '2026-10-23T17:00:00.000Z',
      commit: 'abc1234',
      tests: 168 + 102 + 90,
      coverage: 94.2,
      lighthouse: 96,
    });
  });

  it('records nothing for a build outside CI or with a missing report', () => {
    expect(entryFromReport({ ...deployReport, run: undefined }, now)).toBeUndefined();
    expect(entryFromReport({ ...deployReport, lighthouse: undefined }, now)).toBeUndefined();
    expect(entryFromReport({ ...deployReport, e2e: [] }, now)).toBeUndefined();
  });
});

describe('addEntry', () => {
  it('adds the latest deploy last', () => {
    expect(addEntry([deploy('a'), deploy('b')], deploy('c')).map((d) => d.commit)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('replaces a deploy of the same commit instead of counting it twice', () => {
    const history = addEntry([deploy('a'), deploy('b', 100)], deploy('b', 120));
    expect(history.map((d) => [d.commit, d.tests])).toEqual([
      ['a', 200],
      ['b', 120],
    ]);
  });

  it(`keeps only the latest ${historyLength} deploys`, () => {
    const past = Array.from({ length: historyLength }, (_, i) => deploy(`c${i}`));
    const history = addEntry(past, deploy('new'));
    expect(history).toHaveLength(historyLength);
    expect(history[0]!.commit).toBe('c1');
    expect(history.at(-1)!.commit).toBe('new');
  });
});

describe('parseHistory', () => {
  it('reads a valid history', () => {
    expect(parseHistory([deploy('a')])).toEqual([deploy('a')]);
  });

  it('rejects a file that is not a list of deploys', () => {
    expect(() => parseHistory({})).toThrow('expected a list of deploys');
    expect(() => parseHistory([null])).toThrow('expected an object');
    expect(() => parseHistory([{ ...deploy('a'), date: 'yesterday' }])).toThrow('ISO date');
    expect(() => parseHistory([{ ...deploy('a'), commit: '' }])).toThrow('commit hash');
    expect(() => parseHistory([{ ...deploy('a'), tests: -1 }])).toThrow('"tests"');
  });
});

describe('loadHistory', () => {
  const dirWith = (history?: unknown) => {
    const dir = mkdtempSync(join(tmpdir(), 'history-'));
    if (history !== undefined) writeFileSync(join(dir, 'history.json'), JSON.stringify(history));
    return dir;
  };

  it('adds the deploy being built to the history of the live site', () => {
    const history = loadHistory(dirWith([deploy('old')]), deployReport, now);
    expect(history.map((d) => d.commit)).toEqual(['old', 'abc1234']);
  });

  it('starts the history with the first deploy', () => {
    expect(loadHistory(dirWith(), deployReport, now).map((d) => d.commit)).toEqual(['abc1234']);
  });

  it('leaves the history as it was in a build that is not a deploy', () => {
    expect(loadHistory(dirWith([deploy('old')]), { e2e: [] }, now)).toEqual([deploy('old')]);
    expect(loadHistory(dirWith(), { e2e: [] }, now)).toEqual([]);
  });
});

describe('linePoints', () => {
  const area = { width: 100, height: 50, min: 0, max: 10 };

  it('spreads the values from left to right, with the minimum at the bottom', () => {
    expect(linePoints([0, 5, 10], area)).toBe('0,50 50,25 100,0');
  });

  it('draws values outside the range at its edge', () => {
    expect(linePoints([-5, 20], area)).toBe('0,50 100,0');
  });

  it('puts a single value on the left edge', () => {
    expect(linePoints([5], area)).toBe('0,25');
  });
});

describe('niceMax', () => {
  it('rounds the top of the axis up to a round number', () => {
    expect(niceMax(237)).toBe(250);
    expect(niceMax(300)).toBe(300);
    expect(niceMax(1240)).toBe(1500);
    expect(niceMax(7)).toBe(8);
  });

  it('gives an empty axis a height', () => {
    expect(niceMax(0)).toBe(10);
  });
});

describe('formatDeployDate', () => {
  it('writes the day and month as readers of each language do', () => {
    expect(formatDeployDate('2026-10-23T23:30:00Z', 'en')).toBe('23 Oct');
    expect(formatDeployDate('2026-10-23T23:30:00Z', 'pt')).toBe('23/10');
  });
});
