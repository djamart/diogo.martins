/**
 * Profile content shown across the site: experience, certifications and contact links.
 * Kept as data (not in the i18n strings) so the CV and future translations can reuse it.
 */

export interface Role {
  company: string;
  /** Client the role was delivered for, when placed by a consultancy. */
  client?: string;
  title: string;
  /** ISO year-month, e.g. "2022-10". */
  start: string;
  /** ISO year-month, or undefined for the current role. */
  end?: string;
  summary: string;
  highlights: string[];
}

export interface Certification {
  name: string;
}

export interface ContactLink {
  id: 'email' | 'linkedin' | 'github';
  label: string;
  href: string;
}

export const profile = {
  name: 'Diogo Martins',
  title: 'Quality Enablement Engineer',
  pillars: ['Test automation', 'Quality engineering', 'AI-driven testing'],
  location: 'Porto, Portugal',
} as const;

export const experience: Role[] = [
  {
    company: 'Capital on Tap',
    title: 'QA Engineer',
    start: '2026-07',
    summary:
      'Fintech serving small businesses. QA for the internal platform customer agents use to manage accounts across credit, current account and savings products, in a team of 9 developers and 3 QAs.',
    highlights: [
      'QA lead for a new feature, and QA release lead for the mobile app.',
      'Drives a shift-left approach, coaching developers to test their own work.',
      'Manual and automated testing with Playwright (TypeScript) and API tests in C#.',
    ],
  },
  {
    company: 'Terminalfour',
    title: 'QA Engineer',
    start: '2022-10',
    end: '2026-07',
    summary:
      'Higher-education CMS used by universities. Dedicated QA for the core product in a team of 9 developers and 4 QAs.',
    highlights: [
      'Led the shift from mostly manual testing to AI-assisted testing, with agents planning, writing and running test cases. First in the company to bring AI into the testing workflow.',
      'Found two security vulnerabilities that were published as CVEs.',
      'Owned exploratory testing, test design and planning, and automation with Selenium (Java) and Cypress (JavaScript) on Jenkins and AWS.',
      'Built a Cypress test framework from scratch for an internal product.',
      'Coached developers to test for the wider scenario, catching defects earlier in the cycle.',
    ],
  },
  {
    company: 'Capgemini Engineering',
    client: 'Boehringer Ingelheim',
    title: 'QA Engineer',
    start: '2022-01',
    end: '2022-10',
    summary:
      'Functional testing of genomic data processing and analysis pipelines running on a Linux HPC environment.',
    highlights: [],
  },
];

export const earlierCareer =
  'Before software: quality control at ISQ, logistics and installation at Pura Química, and a pharmacy internship.';

export const certifications: Certification[] = [
  { name: 'AWS Certified Cloud Practitioner' },
  { name: 'Python for Everybody Specialization' },
  { name: 'Software Testing Masterclass: From Novice to Expert' },
  { name: 'Master Software Testing, Jira and Agile on a Live App' },
];

export const contactLinks: ContactLink[] = [
  { id: 'email', label: 'Email', href: 'mailto:a.martins.diogo@gmail.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/diogojamartins/' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/djamart' },
];

const monthFormat = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Formats a "YYYY-MM" month as "Oct 2022". */
export function formatMonth(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) throw new Error(`Invalid month "${month}", expected YYYY-MM`);
  const [, year, monthNumber] = match;
  const index = Number(monthNumber) - 1;
  if (index < 0 || index > 11) throw new Error(`Invalid month "${month}"`);
  return monthFormat.format(new Date(Date.UTC(Number(year), index, 1)));
}

/** Formats a role's period, e.g. "Oct 2022 – Jul 2026" or "Jul 2026 – present". */
export function formatPeriod(role: Pick<Role, 'start' | 'end'>): string {
  return `${formatMonth(role.start)} – ${role.end ? formatMonth(role.end) : 'present'}`;
}
