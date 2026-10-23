import type { ThemeName } from '../styles/tokens';

/** What a visitor can pick in the header: a fixed theme, or whatever the OS colour scheme says. */
export type ThemeChoice = ThemeName | 'system';

/** The options in the theme picker, in the order they are shown. */
export const themeChoices: readonly ThemeChoice[] = ['light', 'dark', 'system'];

/** localStorage key for the theme a visitor picked. Absent means "follow the system". */
export const themeStorageKey = 'theme';

/** The visitor's choice from a stored value; nothing (or junk) means they follow the system. */
export function parseThemeChoice(value: string | null | undefined): ThemeChoice {
  return value === 'light' || value === 'dark' ? value : 'system';
}

/**
 * Where focus goes in the open theme menu after a key press (WAI-ARIA menu pattern):
 * arrows wrap around, Home and End jump to the ends. Null for keys the menu ignores.
 */
export function menuFocusIndex(key: string, index: number, count: number): number | null {
  switch (key) {
    case 'ArrowDown':
      return (index + 1) % count;
    case 'ArrowUp':
      return (index - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
