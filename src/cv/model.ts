import {
  certifications,
  contactLinks,
  earlierCareer,
  experience,
  formatPeriod,
  profile,
} from '../data/profile';
import type { useTranslations } from '../i18n/utils';

type Translate = ReturnType<typeof useTranslations>;

/** File name of the CV, published at the site root, e.g. /diogo.martins/diogo-martins-cv.pdf. */
export const cvFileName = 'diogo-martins-cv.pdf';

export interface CvLink {
  text: string;
  href: string;
}

export interface CvRole {
  heading: string;
  client?: string;
  period: string;
  summary: string;
  highlights: string[];
}

/** Everything the CV shows, built from the same data as the site so the two never drift apart. */
export interface Cv {
  name: string;
  title: string;
  pillars: string;
  location: string;
  links: CvLink[];
  website: CvLink;
  headings: {
    profile: string;
    experience: string;
    earlier: string;
    certifications: string;
    languages: string;
  };
  summary: string;
  roles: CvRole[];
  earlier: string;
  certifications: string[];
  languages: string;
}

/** Shows a link the way it reads on paper: "name@example.com", "github.com/user". */
export function displayLink(href: string): string {
  const url = new URL(href);
  if (url.protocol === 'mailto:') return url.pathname;
  const path = url.pathname.replace(/\/$/, '');
  return `${url.hostname.replace(/^www\./, '')}${path}`;
}

export function buildCv(t: Translate, siteUrl: string): Cv {
  return {
    name: profile.name,
    title: profile.title,
    pillars: profile.pillars.join(' · '),
    location: profile.location,
    links: contactLinks.map((link) => ({ text: displayLink(link.href), href: link.href })),
    website: { text: displayLink(siteUrl), href: siteUrl },
    headings: {
      profile: t('cv.profile'),
      experience: t('experience.title'),
      earlier: t('cv.earlier'),
      certifications: t('about.certifications'),
      languages: t('about.languages'),
    },
    summary: t('cv.summary'),
    roles: experience.map((role) => ({
      heading: `${role.title} · ${role.company}`,
      client: role.client && `${t('experience.for')} ${role.client}`,
      period: formatPeriod(role),
      summary: role.summary,
      highlights: role.highlights,
    })),
    earlier: earlierCareer,
    certifications: certifications.map((certification) => certification.name),
    languages: t('about.languagesList'),
  };
}
