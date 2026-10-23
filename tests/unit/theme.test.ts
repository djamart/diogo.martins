import { describe, expect, it } from 'vitest';
import { parseThemeChoice, themeChoices, themeStorageKey } from '../../src/utils/theme';
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
