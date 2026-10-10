import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from '../../src/utils/contrast';
import { contrastRequirements, palette, themeCss, themes } from '../../src/styles/tokens';

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

describe.each(Object.entries(themes))('%s theme meets WCAG 2.1 AA', (_name, theme) => {
  it.each(contrastRequirements)('$fg on $bg ($reason) is at least $min:1', ({ fg, bg, min }) => {
    expect(contrastRatio(theme[fg], theme[bg])).toBeGreaterThanOrEqual(min);
  });
});

describe('themeCss', () => {
  it('exposes every palette colour and theme token as a CSS custom property', () => {
    const css = themeCss();
    expect(css).toContain('--color-papaya-whip: #fdf0d5;');
    expect(css).toContain('--color-text: #3a3335;');
    expect(css).toMatch(
      /@media \(prefers-color-scheme: dark\) \{ :root \{[^}]*--color-text: #fdf0d5;/,
    );
  });
});
