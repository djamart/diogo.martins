import { describe, expect, it } from 'vitest';
import { blend, contrastRatio, relativeLuminance, translucent } from '../../src/utils/contrast';
import {
  contrastRequirements,
  headerOpacity,
  palette,
  themeCss,
  themes,
} from '../../src/styles/tokens';

describe('contrastRatio', () => {
  it('is 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('is 1:1 for a colour on itself', () => {
    expect(contrastRatio(palette.graphite, palette.graphite)).toBe(1);
  });

  it('does not depend on argument order', () => {
    expect(contrastRatio(palette.graphite, palette.papayaWhip)).toBe(
      contrastRatio(palette.papayaWhip, palette.graphite),
    );
  });

  it('rejects colours that are not 6-digit hex', () => {
    expect(() => relativeLuminance('#fff')).toThrow(/6-digit hex/);
  });
});

describe('blend', () => {
  it('shows only the top colour when it is opaque', () => {
    expect(blend(palette.cinnabar, palette.graphite, 1)).toBe(palette.cinnabar);
  });

  it('shows only the bottom colour when the top one is fully transparent', () => {
    expect(blend(palette.cinnabar, palette.graphite, 0)).toBe(palette.graphite);
  });

  it('mixes each channel in proportion to the opacity', () => {
    expect(blend('#ffffff', '#000000', 0.5)).toBe('#808080');
  });
});

describe('translucent', () => {
  it('writes a hex colour as CSS rgb() with an opacity', () => {
    expect(translucent(palette.papayaWhip, 0.85)).toBe('rgb(253 240 213 / 0.85)');
  });
});

describe.each(Object.entries(themes))('%s theme meets WCAG 2.1 AA', (_name, theme) => {
  it.each(contrastRequirements)('$fg on $bg ($reason) is at least $min:1', ({ fg, bg, min }) => {
    expect(contrastRatio(theme[fg], theme[bg])).toBeGreaterThanOrEqual(min);
  });
});

// The header is see-through once the page scrolls under it, so what shows behind it changes the
// colour its text sits on. Every palette colour could pass behind it: cards, headings, the accent.
describe.each(Object.entries(themes))('%s theme header over scrolled content', (_name, theme) => {
  it.each(Object.entries(palette))('keeps menu text at 4.5:1 over %s', (_colour, under) => {
    const header = blend(theme.bg, under, headerOpacity);
    expect(contrastRatio(theme.text, header)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('themeCss', () => {
  it('exposes every palette colour and theme token as a CSS custom property', () => {
    const css = themeCss();
    expect(css).toContain('--color-papaya-whip: #fdf0d5;');
    expect(css).toContain('--color-text: #3a3335;');
  });

  it('gives the header the page background, slightly see-through, and a shadow in each theme', () => {
    const css = themeCss();
    expect(css).toContain(`--color-header-bg: rgb(253 240 213 / ${headerOpacity});`);
    expect(css).toContain(`--color-header-bg: rgb(58 51 53 / ${headerOpacity});`);
    expect(css.match(/--header-shadow: [^;]+;/g)).toHaveLength(3);
  });

  it('follows the OS colour scheme unless the visitor picked light', () => {
    expect(themeCss()).toMatch(
      /@media \(prefers-color-scheme: dark\) \{ :root:not\(\[data-theme='light'\]\) \{[^}]*--color-text: #fdf0d5;/,
    );
  });

  it('applies the dark theme when the visitor picked it, whatever the OS says', () => {
    expect(themeCss()).toMatch(/^:root\[data-theme='dark'\] \{[^}]*--color-text: #fdf0d5;/m);
  });
});
