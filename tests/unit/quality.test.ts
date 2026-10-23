import { describe, expect, it } from 'vitest';
import { qualityGates } from '../../src/data/quality';
import { ui } from '../../src/i18n/ui';
import { navItems } from '../../src/utils/nav';
import lighthouseConfig from '../../lighthouserc.json';
import vitestConfig from '../../vitest.config';

describe('qualityGates', () => {
  it('has unique ids', () => {
    const ids = qualityGates.map((gate) => gate.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a name, a description and tools for every gate', () => {
    for (const gate of qualityGates) {
      expect(ui.en[gate.nameKey], gate.id).toBeTruthy();
      expect(ui.en[gate.descriptionKey], gate.id).toBeTruthy();
      expect(gate.tools, gate.id).not.toBe('');
    }
  });

  it('lists the pull request gates before the deploy gates', () => {
    const stages = qualityGates.map((gate) => gate.stage);
    expect(stages).toEqual(
      [...stages].sort((a, b) => (a === b ? 0 : a === 'pull-request' ? -1 : 1)),
    );
  });

  it('promises the coverage threshold the unit tests actually enforce', () => {
    const thresholds = vitestConfig.test?.coverage?.thresholds as Record<string, number>;
    for (const metric of ['lines', 'branches', 'functions', 'statements']) {
      expect(thresholds[metric], metric).toBe(80);
    }
    expect(ui.en['quality.gate.unit.description']).toContain('80%');
  });
});

describe('Lighthouse CI', () => {
  const { collect, assert } = lighthouseConfig.ci;

  it('audits every page in the navigation', () => {
    const paths = collect.url.map((url) => new URL(url).pathname);
    expect(paths).toEqual(
      navItems.map((item) =>
        item.path === '' ? '/diogo.martins/' : `/diogo.martins/${item.path}/`,
      ),
    );
  });

  it('promises the minimum score it actually enforces, in all four categories', () => {
    for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
      const assertion =
        assert.assertions[`categories:${category}` as keyof typeof assert.assertions];
      expect(assertion, category).toEqual(['error', { minScore: 0.95 }]);
    }
    expect(ui.en['quality.gate.lighthouse.description']).toContain('95');
  });
});
