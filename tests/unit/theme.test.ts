import { describe, expect, it } from 'vitest';
import {
  effectiveTheme,
  oppositeTheme,
  parseStoredTheme,
  themeStorageKey,
} from '../../src/utils/theme';

describe('parseStoredTheme', () => {
  it('accepts the two theme names', () => {
    expect(parseStoredTheme('light')).toBe('light');
    expect(parseStoredTheme('dark')).toBe('dark');
  });

  it('treats a missing or unknown value as no choice', () => {
    expect(parseStoredTheme(null)).toBeNull();
    expect(parseStoredTheme(undefined)).toBeNull();
    expect(parseStoredTheme('Dark')).toBeNull();
    expect(parseStoredTheme('')).toBeNull();
  });
});

describe('effectiveTheme', () => {
  it('follows the OS colour scheme when the visitor has not chosen', () => {
    expect(effectiveTheme(null, true)).toBe('dark');
    expect(effectiveTheme(null, false)).toBe('light');
  });

  it("keeps the visitor's choice over the OS colour scheme", () => {
    expect(effectiveTheme('light', true)).toBe('light');
    expect(effectiveTheme('dark', false)).toBe('dark');
  });
});

describe('oppositeTheme', () => {
  it('switches between light and dark', () => {
    expect(oppositeTheme('light')).toBe('dark');
    expect(oppositeTheme('dark')).toBe('light');
  });
});

it('stores the choice under a stable key, so returning visitors keep it', () => {
  expect(themeStorageKey).toBe('theme');
});
