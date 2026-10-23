import type { UiKey } from '../i18n/ui';

/** A check every change must pass, shown on the /quality page in the order it runs. */
export interface QualityGate {
  id: string;
  /** Tool names, shown as-is. */
  tools: string;
  nameKey: UiKey;
  descriptionKey: UiKey;
  /** When the gate runs: on every pull request (and main), or once the site is deployed. */
  stage: 'pull-request' | 'deploy';
}

export const qualityGates: QualityGate[] = [
  {
    id: 'static',
    tools: 'ESLint, Prettier, astro check',
    nameKey: 'quality.gate.static.name',
    descriptionKey: 'quality.gate.static.description',
    stage: 'pull-request',
  },
  {
    id: 'unit',
    tools: 'Vitest',
    nameKey: 'quality.gate.unit.name',
    descriptionKey: 'quality.gate.unit.description',
    stage: 'pull-request',
  },
  {
    id: 'e2e',
    tools: 'Playwright',
    nameKey: 'quality.gate.e2e.name',
    descriptionKey: 'quality.gate.e2e.description',
    stage: 'pull-request',
  },
  {
    id: 'a11y',
    tools: 'axe-core',
    nameKey: 'quality.gate.a11y.name',
    descriptionKey: 'quality.gate.a11y.description',
    stage: 'pull-request',
  },
  {
    id: 'deploy',
    tools: 'GitHub Actions, GitHub Pages',
    nameKey: 'quality.gate.deploy.name',
    descriptionKey: 'quality.gate.deploy.description',
    stage: 'deploy',
  },
  {
    id: 'smoke',
    tools: 'Playwright',
    nameKey: 'quality.gate.smoke.name',
    descriptionKey: 'quality.gate.smoke.description',
    stage: 'deploy',
  },
];
