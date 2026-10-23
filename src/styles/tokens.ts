/**
 * Colour palette and semantic theme tokens.
 * This is the single source of truth: the CSS custom properties are generated from it
 * (see BaseLayout.astro) and tests/unit/contrast.test.ts checks every pairing against WCAG AA.
 */

export const palette = {
  graphite: '#3a3335',
  raspberryRed: '#d81e5b',
  cinnabar: '#f0544f',
  papayaWhip: '#fdf0d5',
  ashGrey: '#c6d8d3',
} as const;

export type ThemeName = 'light' | 'dark';

export interface Theme {
  /** Page background. */
  bg: string;
  /** Cards and highlighted blocks. */
  surface: string;
  /** Body text. */
  text: string;
  /** Secondary text (captions, meta). */
  muted: string;
  /** Headings. Large text only (24px+, or 18.66px+ bold). */
  heading: string;
  /** Link underlines, borders and other non-text accents. */
  accent: string;
  /** Keyboard focus outline. */
  focus: string;
  /** Purely decorative shapes. Never text. */
  decor: string;
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    bg: palette.papayaWhip,
    surface: palette.ashGrey,
    text: palette.graphite,
    muted: palette.graphite,
    // Cinnabar on both themes, so the accent looks the same in light and dark (3.06:1 here).
    heading: palette.cinnabar,
    accent: palette.cinnabar,
    focus: palette.cinnabar,
    decor: palette.cinnabar,
  },
  dark: {
    bg: palette.graphite,
    surface: palette.graphite,
    text: palette.papayaWhip,
    muted: palette.ashGrey,
    heading: palette.cinnabar,
    accent: palette.cinnabar,
    focus: palette.cinnabar,
    decor: palette.raspberryRed,
  },
};

/** WCAG 2.1 AA minimums: 4.5 for normal text, 3 for large text and non-text UI (1.4.3, 1.4.11). */
export const contrastRequirements: ReadonlyArray<{
  fg: keyof Theme;
  bg: keyof Theme;
  min: number;
  reason: string;
}> = [
  { fg: 'text', bg: 'bg', min: 4.5, reason: 'body text' },
  { fg: 'text', bg: 'surface', min: 4.5, reason: 'body text on cards' },
  { fg: 'muted', bg: 'bg', min: 4.5, reason: 'secondary text' },
  { fg: 'heading', bg: 'bg', min: 3, reason: 'large headings' },
  { fg: 'accent', bg: 'bg', min: 3, reason: 'link underlines and borders' },
  { fg: 'focus', bg: 'bg', min: 3, reason: 'focus indicator' },
];

const cssName = (key: string) => `--color-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

function declarations(entries: Record<string, string>): string {
  return Object.entries(entries)
    .map(([key, value]) => `${cssName(key)}: ${value};`)
    .join(' ');
}

/**
 * CSS custom properties for the palette and both themes. The OS colour scheme decides,
 * unless the visitor picked a theme with the toggle (`data-theme` on the root element).
 */
export function themeCss(): string {
  const dark = `${declarations({ ...themes.dark })} color-scheme: dark;`;
  return [
    `:root { ${declarations(palette)} ${declarations({ ...themes.light })} color-scheme: light; }`,
    `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { ${dark} } }`,
    `:root[data-theme='dark'] { ${dark} }`,
  ].join('\n');
}
