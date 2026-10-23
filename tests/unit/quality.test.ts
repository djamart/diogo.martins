import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { loadPostFiles, parsePostId, postPath, published } from '../../src/blog/posts';
import { qualityGates } from '../../src/data/quality';
import { languages, ui, type Lang } from '../../src/i18n/ui';
import { navItems, pageHref } from '../../src/utils/nav';
import lighthouseConfig from '../../lighthouserc.json';
import vitestConfig from '../../vitest.config';
import playwrightConfig from '../../playwright.config';
import { devices } from '@playwright/test';

const langs = Object.keys(languages) as Lang[];

describe('qualityGates', () => {
  it('has unique ids', () => {
    const ids = qualityGates.map((gate) => gate.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a name, a description and tools for every gate', () => {
    for (const gate of qualityGates) {
      for (const lang of langs) {
        expect(ui[lang][gate.nameKey], `${lang} ${gate.id}`).toBeTruthy();
        expect(ui[lang][gate.descriptionKey], `${lang} ${gate.id}`).toBeTruthy();
      }
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
    for (const lang of langs) {
      expect(ui[lang]['quality.gate.unit.description'], lang).toContain('80%');
    }
  });

  it('names the phones the end-to-end tests actually emulate', () => {
    const phones = (playwrightConfig.projects ?? []).filter((project) => project.use?.isMobile);
    expect(phones.map((project) => project.name)).toEqual(['mobile-chrome', 'mobile-safari']);
    for (const project of phones) {
      const device = Object.entries(devices).find(
        ([, descriptor]) => descriptor.userAgent === project.use?.userAgent,
      )?.[0];
      expect(device, project.name).toBeDefined();
      for (const lang of langs) {
        expect(ui[lang]['quality.gate.mobile.description'], lang).toContain(device);
      }
    }
  });

  it('compares screenshots on the desktop and the phone it promises', async () => {
    // Vite sets BASE_URL for its own use, which the config would read as a live site to test.
    vi.stubEnv('BASE_URL', '');
    vi.resetModules();
    const { default: localConfig } = await import('../../playwright.config');
    vi.unstubAllEnvs();
    const ignores = (project: { testIgnore?: unknown }) =>
      [project.testIgnore ?? []]
        .flat()
        .some((pattern) => pattern instanceof RegExp && pattern.test('e2e/visual.spec.ts'));
    const visual = (localConfig.projects ?? []).filter((project) => !ignores(project));
    expect(visual.map((project) => project.name)).toEqual(['chromium', 'mobile-chrome']);
    expect(ui.en['quality.gate.visual.description']).toContain('on a desktop and on a phone');
    expect(ui.pt['quality.gate.visual.description']).toContain('num computador e num telemóvel');
  });
});

describe('Lighthouse CI', () => {
  const { collect, assert } = lighthouseConfig.ci;

  it('audits every page in the navigation, in every language, then every blog post', () => {
    const paths = collect.url.map((url) => new URL(url).pathname);
    const posts = published(loadPostFiles(join(process.cwd(), 'src', 'content', 'blog'))).map(
      (post) => {
        const { lang, slug } = parsePostId(post.id);
        return pageHref('/diogo.martins/', postPath(slug), lang);
      },
    );
    expect(paths).toEqual([
      ...langs.flatMap((lang) =>
        navItems.map((item) => pageHref('/diogo.martins/', item.path, lang)),
      ),
      ...posts,
    ]);
  });

  it('promises the minimum score it actually enforces, in all four categories', () => {
    for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
      const assertion =
        assert.assertions[`categories:${category}` as keyof typeof assert.assertions];
      expect(assertion, category).toEqual(['error', { minScore: 0.95 }]);
    }
    for (const lang of langs) {
      expect(ui[lang]['quality.gate.lighthouse.description'], lang).toContain('95');
    }
  });
});
