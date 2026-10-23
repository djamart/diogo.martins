/**
 * Profile content shown across the site: experience, certifications and contact links.
 * Kept as data (not in the i18n strings) so the CV and every language reuse it. Free text is
 * written in every language side by side, so a translation cannot fall behind.
 */

import { defaultLang, type Lang } from '../i18n/ui';
import { useTranslations } from '../i18n/utils';

/** A text in every language of the site. */
export type Localized = Record<Lang, string>;

export interface Role {
  company: string;
  /** Client the role was delivered for, when placed by a consultancy. */
  client?: string;
  title: string;
  /** ISO year-month, e.g. "2022-10". */
  start: string;
  /** ISO year-month, or undefined for the current role. */
  end?: string;
  summary: Localized;
  highlights: Localized[];
}

/** One of the three areas Diogo works in: a short name and a line on what it means in practice. */
export interface Pillar {
  name: Localized;
  summary: Localized;
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
  pillars: [
    {
      name: { en: 'Test automation', pt: 'Automação de testes' },
      summary: {
        en: 'Playwright and TypeScript tests that run on every change and catch regressions before release.',
        pt: 'Testes em Playwright e TypeScript que correm a cada alteração e apanham regressões antes de cada versão.',
      },
    },
    {
      name: { en: 'Quality engineering', pt: 'Engenharia de qualidade' },
      summary: {
        en: 'Helping developers test their own work and catch problems before they reach QA.',
        pt: 'Ajudar os programadores a testar o próprio trabalho e a apanhar problemas antes de chegarem ao QA.',
      },
    },
    {
      name: { en: 'AI-driven testing', pt: 'Testes com IA' },
      summary: {
        en: 'AI agents and skills that plan, write and run tests, with people reviewing the results.',
        pt: 'Agentes e skills de IA que planeiam, escrevem e executam testes, com pessoas a rever os resultados.',
      },
    },
  ] satisfies Pillar[],
  location: 'Porto, Portugal',
} as const;

export const experience: Role[] = [
  {
    company: 'Capital on Tap',
    title: 'QA Engineer',
    start: '2026-07',
    summary: {
      en: 'Fintech serving small businesses. QA for the internal platform customer agents use to manage accounts across credit, current account and savings products.',
      pt: 'Fintech para pequenas empresas. QA da plataforma interna que os agentes de apoio ao cliente usam para gerir contas de crédito, conta corrente e poupança.',
    },
    highlights: [
      {
        en: 'QA lead for a new feature, and QA release lead for the mobile app.',
        pt: 'QA lead de uma nova funcionalidade e QA release lead da app móvel.',
      },
      {
        en: 'Coaches developers to test their own work, so problems are caught before they reach QA (shift-left).',
        pt: 'Orienta os programadores a testarem o próprio trabalho, para os problemas serem apanhados antes de chegarem ao QA (shift-left).',
      },
      {
        en: 'Manual and automated testing with Playwright (TypeScript) and API tests in C#.',
        pt: 'Testes manuais e automatizados com Playwright (TypeScript) e testes de API em C#.',
      },
    ],
  },
  {
    company: 'Terminalfour',
    title: 'QA Engineer',
    start: '2022-10',
    end: '2026-07',
    summary: {
      en: 'Higher-education CMS used by universities. Dedicated QA for the core product.',
      pt: 'CMS para o ensino superior, usado por universidades. QA dedicado ao produto principal.',
    },
    highlights: [
      {
        en: 'Led the shift from mostly manual testing to AI-assisted testing, with agents planning, writing and running test cases. First in the company to bring AI into the testing workflow.',
        pt: 'Liderou a passagem de testes sobretudo manuais para testes assistidos por IA, com agentes a planear, escrever e executar casos de teste. Foi o primeiro na empresa a trazer a IA para o processo de testes.',
      },
      {
        en: 'Found two security vulnerabilities that were published as CVEs.',
        pt: 'Encontrou duas vulnerabilidades de segurança que foram publicadas como CVE.',
      },
      {
        en: 'Owned exploratory testing, test design and planning, and automation with Selenium (Java) and Cypress (JavaScript) on Jenkins and AWS.',
        pt: 'Responsável pelos testes exploratórios, pelo desenho e planeamento de testes e pela automação com Selenium (Java) e Cypress (JavaScript) em Jenkins e AWS.',
      },
      {
        en: 'Built a Cypress test framework from scratch for an internal product.',
        pt: 'Criou de raiz uma framework de testes em Cypress para um produto interno.',
      },
      {
        en: 'Coached developers to test for the wider scenario, catching defects earlier in the cycle.',
        pt: 'Orientou os programadores a testar o cenário mais amplo, detetando defeitos mais cedo no ciclo.',
      },
    ],
  },
  {
    company: 'Capgemini Engineering',
    client: 'Boehringer Ingelheim',
    title: 'QA Engineer',
    start: '2022-01',
    end: '2022-10',
    summary: {
      en: 'Functional testing of genomic data processing and analysis pipelines running on a Linux HPC environment.',
      pt: 'Testes funcionais de pipelines de processamento e análise de dados genómicos num ambiente HPC em Linux.',
    },
    highlights: [],
  },
];

export const earlierCareer: Localized = {
  en: 'Before software: quality control at ISQ, logistics and installation at Pura Química, and a pharmacy internship.',
  pt: 'Antes do software: controlo de qualidade no ISQ, logística e instalação na Pura Química, e um estágio em farmácia.',
};

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

// Spelled out rather than from Intl, whose month names depend on the ICU data Node was built with.
const monthNames: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  pt: [
    'jan.',
    'fev.',
    'mar.',
    'abr.',
    'mai.',
    'jun.',
    'jul.',
    'ago.',
    'set.',
    'out.',
    'nov.',
    'dez.',
  ],
};

/** Formats a "YYYY-MM" month as "Oct 2022", or "out. 2022" in Portuguese. */
export function formatMonth(month: string, lang: Lang = defaultLang): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) throw new Error(`Invalid month "${month}", expected YYYY-MM`);
  const [, year, monthNumber] = match;
  const index = Number(monthNumber) - 1;
  if (index < 0 || index > 11) throw new Error(`Invalid month "${month}"`);
  return `${monthNames[lang][index]} ${year}`;
}

/** Formats a role's period, e.g. "Oct 2022 – Jul 2026" or "Jul 2026 – present". */
export function formatPeriod(role: Pick<Role, 'start' | 'end'>, lang: Lang = defaultLang): string {
  const end = role.end ? formatMonth(role.end, lang) : useTranslations(lang)('experience.present');
  return `${formatMonth(role.start, lang)} – ${end}`;
}
