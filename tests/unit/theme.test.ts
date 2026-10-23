import { describe, expect, it } from 'vitest';
import {
  menuFocusIndex,
  parseThemeChoice,
  themeChoices,
  themeStorageKey,
} from '../../src/utils/theme';
import { ui } from '../../src/i18n/ui';

describe('parseThemeChoice', () => {
  it('returns a stored light or dark theme', () => {
    expect(parseThemeChoice('light')).toBe('light');
    expect(parseThemeChoice('dark')).toBe('dark');
  });

  it('follows the system when nothing, or something unknown, is stored', () => {
    expect(parseThemeChoice(null)).toBe('system');
    expect(parseThemeChoice(undefined)).toBe('system');
    expect(parseThemeChoice('Dark')).toBe('system');
    expect(parseThemeChoice('')).toBe('system');
  });
});

describe('themeChoices', () => {
  it('offers light, dark and system, each with a label', () => {
    expect(themeChoices).toEqual(['light', 'dark', 'system']);
    for (const choice of themeChoices) {
      expect(ui.en[`theme.${choice}`]).toBeTruthy();
    }
  });
});

it('stores the choice under a stable key, so returning visitors keep it', () => {
  expect(themeStorageKey).toBe('theme');
});

describe('menuFocusIndex', () => {
  it('moves down and up through the options', () => {
    expect(menuFocusIndex('ArrowDown', 0, 3)).toBe(1);
    expect(menuFocusIndex('ArrowUp', 2, 3)).toBe(1);
  });

  it('wraps around at either end', () => {
    expect(menuFocusIndex('ArrowDown', 2, 3)).toBe(0);
    expect(menuFocusIndex('ArrowUp', 0, 3)).toBe(2);
  });

  it('jumps to the first and last option with Home and End', () => {
    expect(menuFocusIndex('Home', 1, 3)).toBe(0);
    expect(menuFocusIndex('End', 1, 3)).toBe(2);
  });

  it('ignores other keys', () => {
    expect(menuFocusIndex('a', 1, 3)).toBeNull();
  });
});
