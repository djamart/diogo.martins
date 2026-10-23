import type { APIRoute } from 'astro';
import { buildCv } from '../cv/model';
import { renderCvPdf } from '../cv/pdf';
import { defaultLang } from '../i18n/ui';
import { pageHref } from '../utils/nav';

/**
 * Builds the CV PDF from the site content at build time, so it ships with every deploy.
 * There is one CV, in English, linked from every language of the site.
 */
export const GET: APIRoute = async ({ site }) => {
  const siteUrl = new URL(pageHref(import.meta.env.BASE_URL, ''), site).href;
  const pdf = await renderCvPdf(buildCv(defaultLang, siteUrl));
  return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
};
