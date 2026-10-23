import { describe, expect, it } from 'vitest';
import {
  certifications,
  contactLinks,
  earlierCareer,
  experience,
  formatMonth,
  formatPeriod,
  profile,
  type Localized,
} from '../../src/data/profile';
import { languages, type Lang } from '../../src/i18n/ui';

describe('formatMonth', () => {
  it('formats a year-month as a short month and year', () => {
    expect(formatMonth('2022-10')).toBe('Oct 2022');
  });

  it('formats a month in Portuguese', () => {
    expect(formatMonth('2022-10', 'pt')).toBe('out. 2022');
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

  it('shows "presente" for the current role in Portuguese', () => {
    expect(formatPeriod({ start: '2026-07' }, 'pt')).toBe('jul. 2026 – presente');
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

describe('translations', () => {
  const texts: [string, Localized][] = [
    ...profile.pillars.flatMap((pillar, index): [string, Localized][] => [
      [`pillar ${index} name`, pillar.name],
      [`pillar ${index} summary`, pillar.summary],
    ]),
    ['earlier career', earlierCareer],
    ...experience.flatMap((role) => [
      [`${role.company} summary`, role.summary] as [string, Localized],
      ...role.highlights.map((highlight, index): [string, Localized] => [
        `${role.company} highlight ${index}`,
        highlight,
      ]),
    ]),
  ];

  it('has every profile text in every language', () => {
    for (const [name, text] of texts) {
      for (const lang of Object.keys(languages) as Lang[]) {
        expect(text[lang], `${name} (${lang})`).toBeTruthy();
      }
    }
  });

  it('never mentions a CVE identifier in any language', () => {
    for (const [name, text] of texts) {
      for (const value of Object.values(text)) {
        expect(value, name).not.toMatch(/CVE-\d{4}-\d+/i);
      }
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
