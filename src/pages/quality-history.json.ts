import { join } from 'node:path';
import type { APIRoute } from 'astro';
import { loadHistory } from '../quality/history';
import { loadQualityReport } from '../quality/report';

/**
 * The deploy history behind the trend on the /quality page, published with the site so the next
 * deploy can download it and add itself (see src/quality/history.ts).
 */
export const GET: APIRoute = () => {
  const reports = join(process.cwd(), 'reports');
  const history = loadHistory(reports, loadQualityReport(reports, process.env));
  return new Response(`${JSON.stringify(history, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/json' },
  });
};
