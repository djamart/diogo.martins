import type { ThemeName } from '../styles/tokens';

/** localStorage key for the theme a visitor picked with the toggle. */
export const themeStorageKey = 'theme';

/** The stored choice, or null when the visitor never picked one (or storage holds junk). */
export function parseStoredTheme(value: string | null | undefined): ThemeName | null {
  return value === 'light' || value === 'dark' ? value : null;
}

/** The theme on screen: the visitor's choice wins, otherwise the OS colour scheme. */
export function effectiveTheme(stored: ThemeName | null, prefersDark: boolean): ThemeName {
  return stored ?? (prefersDark ? 'dark' : 'light');
}

export function oppositeTheme(theme: ThemeName): ThemeName {
  return theme === 'dark' ? 'light' : 'dark';
}
