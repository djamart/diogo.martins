import { describe, expect, it } from 'vitest';
import {
  certifications,
  contactLinks,
  experience,
  formatMonth,
  formatPeriod,
} from '../../src/data/profile';

describe('formatMonth', () => {
  it('formats a year-month as a short month and year', () => {
    expect(formatMonth('2022-10')).toBe('Oct 2022');
  });

  it('rejects a value that is not YYYY-MM', () => {
    expect(() => formatMonth('October 2022')).toThrow(/expected YYYY-MM/);
  });

  it('rejects a month outside 01 to 12', () => {
    expect(() => formatMonth('2022-13')).toThrow(/Invalid month/);
  });
});

describe('formatPeriod', () => {
  it('shows start and end months', () => {
    expect(formatPeriod({ start: '2022-10', end: '2026-07' })).toBe('Oct 2022 – Jul 2026');
  });

  it('shows "present" for the current role', () => {
    expect(formatPeriod({ start: '2026-07' })).toBe('Jul 2026 – present');
  });
});

describe('experience', () => {
  it('lists the most recent role first', () => {
    const starts = experience.map((role) => role.start);
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it('has only one current role, and it is the first', () => {
    const current = experience.filter((role) => role.end === undefined);
    expect(current).toEqual([experience[0]]);
  });

  it('never ends a role before it starts', () => {
    for (const role of experience) {
      if (role.end) expect(role.end >= role.start, role.company).toBe(true);
    }
  });

  it('has valid dates for every role', () => {
    for (const role of experience) {
      expect(() => formatPeriod(role), role.company).not.toThrow();
    }
  });
});

describe('certifications', () => {
  it('has no duplicates', () => {
    const names = certifications.map((certification) => certification.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('contactLinks', () => {
  it('uses mailto for email and https for everything else', () => {
    for (const link of contactLinks) {
      const expected = link.id === 'email' ? 'mailto:' : 'https:';
      expect(new URL(link.href).protocol, link.id).toBe(expected);
    }
  });

  it('never publishes a phone number', () => {
    for (const link of contactLinks) {
      expect(link.href, link.id).not.toMatch(/^tel:|\d{9}/);
    }
  });
});
