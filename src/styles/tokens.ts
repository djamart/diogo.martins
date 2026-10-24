/**
 * Colour palette and semantic theme tokens.
 * This is the single source of truth: the CSS custom properties are generated from it
 * (see BaseLayout.astro) and tests/unit/contrast.test.ts checks every pairing against WCAG AA.
 */

import { translucent } from '../utils/contrast';

export const palette = {
  graphite: '#3a3335',
  raspberryRed: '#d81e5b',
  cinnabar: '#f0544f',
  papayaWhip: '#fdf0d5',
  ashGrey: '#c6d8d3',
  /** Graphite lifted a step, for cards on the dark background. */
  graphiteRaised: '#4a4245',
  /** Papaya whip a shade darker, for form fields on the light background. */
  papayaWhipShade: '#f3e2bf',
  /** Graphite a step down, for form fields on the dark background. */
  graphiteSunken: '#2e282a',
  /** Ash grey a shade darker, for a hovered card-coloured control on the light background. */
  ashGreyShade: '#a9c2bb',
  /** Graphite lifted two steps, for a hovered card-coloured control on the dark background. */
  graphiteHighlight: '#605659',
} as const;

export type ThemeName = 'light' | 'dark';

export interface Theme {
  /** Page background. */
  bg: string;
  /** Cards and highlighted blocks. */
  surface: string;
  /** A control on the surface colour under the pointer, such as a footer contact link. */
  surfaceHover: string;
  /** Inside form fields, a shade darker than the page so they read as places to type. */
  field: string;
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
    surfaceHover: palette.ashGreyShade,
    field: palette.papayaWhipShade,
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
    surface: palette.graphiteRaised,
    surfaceHover: palette.graphiteHighlight,
    field: palette.graphiteSunken,
    text: palette.papayaWhip,
    muted: palette.ashGrey,
    heading: palette.cinnabar,
    accent: palette.cinnabar,
    focus: palette.cinnabar,
    decor: palette.raspberryRed,
  },
};

/**
 * The header stays at the top of the window. Once the page scrolls under it, it takes the page
 * background at this opacity, blurred, so the content behind shows through faintly.
 */
export const headerOpacity = 0.85;

/** The header's shadow once the page scrolls under it; deeper in the dark theme to stay visible. */
export const headerShadow: Record<ThemeName, string> = {
  light: '0 2px 16px rgb(58 51 53 / 0.14)',
  dark: '0 2px 16px rgb(0 0 0 / 0.45)',
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
  { fg: 'text', bg: 'surfaceHover', min: 4.5, reason: 'link text on a hovered contact link' },
  { fg: 'muted', bg: 'bg', min: 4.5, reason: 'secondary text' },
  { fg: 'text', bg: 'field', min: 4.5, reason: 'text typed in form fields' },
  { fg: 'muted', bg: 'field', min: 3, reason: 'form field borders' },
  { fg: 'heading', bg: 'bg', min: 3, reason: 'large headings' },
  { fg: 'accent', bg: 'bg', min: 3, reason: 'link underlines and borders' },
  { fg: 'focus', bg: 'bg', min: 3, reason: 'focus indicator' },
];

const cssName = (key: string) => `--color-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

/** A theme's colour tokens plus the header's translucent background and shadow. */
function themeDeclarations(name: ThemeName): string {
  const theme = themes[name];
  return [
    declarations({ ...theme, headerBg: translucent(theme.bg, headerOpacity) }),
    `--header-shadow: ${headerShadow[name]};`,
  ].join(' ');
}

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
  const dark = `${themeDeclarations('dark')} color-scheme: dark;`;
  return [
    `:root { ${declarations(palette)} ${themeDeclarations('light')} color-scheme: light; }`,
    `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { ${dark} } }`,
    `:root[data-theme='dark'] { ${dark} }`,
  ].join('\n');
}
