import { beforeAll, describe, expect, it } from 'vitest';
import { buildCv, displayLink, type Cv } from '../../src/cv/model';
import { cvColors, cvHeadingSize, renderCvPdf } from '../../src/cv/pdf';
import { palette } from '../../src/styles/tokens';
import { contrastRatio } from '../../src/utils/contrast';
import { GET } from '../../src/pages/diogo-martins-cv.pdf';
import { certifications, contactLinks, experience, profile } from '../../src/data/profile';
import { useTranslations } from '../../src/i18n/utils';
import { pdfText } from './helpers/pdfText';

const siteUrl = 'https://djamart.github.io/diogo.martins/';
const cv: Cv = buildCv(useTranslations('en'), siteUrl);

describe('displayLink', () => {
  it('shows an email address without mailto', () => {
    expect(displayLink('mailto:someone@example.com')).toBe('someone@example.com');
  });

  it('shows a web address without protocol, www or trailing slash', () => {
    expect(displayLink('https://www.linkedin.com/in/someone/')).toBe('linkedin.com/in/someone');
  });
});

describe('buildCv', () => {
  it('uses the name and title from the profile', () => {
    expect(cv.name).toBe(profile.name);
    expect(cv.title).toBe(profile.title);
  });

  it('links to email, LinkedIn, GitHub and the website', () => {
    expect(cv.links.map((link) => link.href)).toEqual(contactLinks.map((link) => link.href));
    expect(cv.website).toEqual({ text: 'djamart.github.io/diogo.martins', href: siteUrl });
  });

  it('lists every role in the same order as the experience page', () => {
    expect(cv.roles).toHaveLength(experience.length);
    cv.roles.forEach((role, index) => {
      expect(role.heading).toContain(experience[index].company);
    });
    expect(cv.roles[0].period).toMatch(/present$/);
  });

  it('names the client of a consultancy role', () => {
    expect(cv.roles.find((role) => role.heading.includes('Capgemini'))?.client).toBe(
      'for Boehringer Ingelheim',
    );
  });

  it('lists every certification', () => {
    expect(cv.certifications).toEqual(certifications.map((certification) => certification.name));
  });
});

describe('renderCvPdf', () => {
  let pdf: Uint8Array;
  let text: string;

  beforeAll(async () => {
    pdf = await renderCvPdf(cv, { compress: false });
    text = pdfText(pdf);
  });

  it('produces a PDF file', () => {
    expect(Buffer.from(pdf.subarray(0, 5)).toString('latin1')).toBe('%PDF-');
  });

  it('fits on one page', () => {
    const pages =
      Buffer.from(pdf)
        .toString('latin1')
        .match(/\/Type \/Page\b/g) ?? [];
    expect(pages).toHaveLength(1);
  });

  it('sets the document title and author', () => {
    const source = Buffer.from(pdf).toString('latin1');
    expect(source).toMatch(/\/Title \d+ 0 R/);
    expect(source).toContain('(Diogo Martins | CV)');
    expect(source).toMatch(/\/Author \d+ 0 R/);
  });

  it('shows the header, every role and every certification', () => {
    expect(text).toContain('Diogo Martins');
    expect(text).toContain('Quality Enablement Engineer');
    for (const role of cv.roles) expect(text).toContain(role.heading);
    for (const name of cv.certifications) expect(text).toContain(name);
  });

  it('shows email, LinkedIn and GitHub as clickable links', () => {
    const source = Buffer.from(pdf).toString('latin1');
    for (const link of cv.links) {
      expect(text).toContain(link.text);
      expect(source).toContain(`/URI (${link.href})`);
    }
  });

  it('never shows a phone number or a CVE identifier', () => {
    expect(text).not.toMatch(/\+?\d[\d ]{8,}\d/);
    expect(text).not.toMatch(/CVE-\d{4}-\d+/i);
  });
});

describe('CV endpoint', () => {
  it('serves the CV as a PDF', async () => {
    const response = await GET({ site: new URL('https://djamart.github.io') } as Parameters<
      typeof GET
    >[0]);

    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    const body = new Uint8Array(await response.arrayBuffer());
    expect(Buffer.from(body.subarray(0, 5)).toString('latin1')).toBe('%PDF-');
  });
});

describe('CV colours', () => {
  it('use the same accent as the site', () => {
    expect(cvColors.accent).toBe(palette.cinnabar);
  });

  it('keep the accent on large text, where 3:1 on white meets WCAG AA', () => {
    expect(cvHeadingSize).toBeGreaterThanOrEqual(14);
    expect(contrastRatio(cvColors.accent, '#ffffff')).toBeGreaterThanOrEqual(3);
  });

  it('keep body text at 4.5:1 on white', () => {
    expect(contrastRatio(cvColors.text, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });
});
