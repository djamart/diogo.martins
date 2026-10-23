import PDFDocument from 'pdfkit';
import { palette } from '../styles/tokens';
import type { Cv } from './model';

export interface RenderOptions {
  /** Compress page content. Turned off in tests so the text can be read back. */
  compress?: boolean;
}

const fonts = { regular: 'Helvetica', bold: 'Helvetica-Bold' } as const;
/** Same accent as the site. Only on large text (14pt+ bold) and rules, so 3:1 on white is enough. */
export const cvColors = { text: palette.graphite, accent: palette.cinnabar } as const;
/** Section headings: 14pt bold is the smallest size WCAG counts as large text. */
export const cvHeadingSize = 14;
const margin = 50;

/** Renders the CV as an A4 PDF, using the built-in PDF fonts so no font files are needed. */
export function renderCvPdf(cv: Cv, options: RenderOptions = {}): Promise<Uint8Array<ArrayBuffer>> {
  const doc = new PDFDocument({
    size: 'A4',
    margin,
    compress: options.compress ?? true,
    lang: cv.lang,
    displayTitle: true,
    info: {
      Title: `${cv.name} | CV`,
      Author: cv.name,
      Subject: `${cv.title}: ${cv.pillars}`,
    },
  });

  const chunks: Buffer[] = [];
  const done = new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    doc.on('error', reject);
  });

  const width = doc.page.width - margin * 2;

  const section = (heading: string) => {
    doc.moveDown(0.8);
    doc
      .font(fonts.bold)
      .fontSize(cvHeadingSize)
      .fillColor(cvColors.accent)
      .text(heading.toUpperCase());
    const y = doc.y + 2;
    doc
      .moveTo(margin, y)
      .lineTo(margin + width, y)
      .lineWidth(0.75)
      .strokeColor(cvColors.accent)
      .stroke();
    doc.moveDown(0.5).fillColor(cvColors.text);
  };

  const body = (text: string) => doc.font(fonts.regular).fontSize(10).text(text, { lineGap: 2 });

  const bullets = (items: string[]) =>
    doc.font(fonts.regular).fontSize(10).list(items, {
      bulletRadius: 1.5,
      textIndent: 10,
      indent: 10,
      lineGap: 2,
      paragraphGap: 2,
    });

  // Header
  doc.font(fonts.bold).fontSize(24).fillColor(cvColors.accent).text(cv.name);
  doc.font(fonts.bold).fontSize(13).fillColor(cvColors.text).text(cv.title);
  doc.font(fonts.regular).fontSize(10).text(`${cv.pillars}  |  ${cv.location}`);
  doc.moveDown(0.3);
  cv.links.forEach((link, index) => {
    const last = index === cv.links.length - 1;
    doc.text(link.text, { link: link.href, underline: true, continued: !last });
    if (!last) doc.text('   ', { link: null, underline: false, continued: true });
  });
  doc.text(cv.website.text, { link: cv.website.href, underline: true });

  section(cv.headings.profile);
  body(cv.summary);

  section(cv.headings.experience);
  cv.roles.forEach((role, index) => {
    if (index > 0) doc.moveDown(0.6);
    doc.font(fonts.bold).fontSize(11).text(role.heading, { continued: !!role.client });
    if (role.client) doc.font(fonts.regular).text(` ${role.client}`);
    doc.font(fonts.regular).fontSize(9).text(role.period);
    doc.moveDown(0.2);
    body(role.summary);
    if (role.highlights.length > 0) {
      doc.moveDown(0.2);
      bullets(role.highlights);
    }
  });

  section(cv.headings.earlier);
  body(cv.earlier);

  section(cv.headings.certifications);
  bullets(cv.certifications);

  section(cv.headings.languages);
  body(cv.languages);

  doc.end();
  return done;
}
