import type { Locator, Page } from '@playwright/test';
import { ui, type Lang } from '../../../src/i18n/ui';
import { themeStorageKey } from '../../../src/utils/theme';

export type ThemeOptionName = 'Light' | 'Dark' | 'System';

/** The theme menu in the header: one button that opens a menu of Light, Dark and System. */
export class ThemeMenu {
  readonly button: Locator;
  readonly menu: Locator;

  constructor(
    private readonly page: Page,
    lang: Lang,
  ) {
    const label = ui[lang]['theme.label'];
    this.button = page.getByRole('button', { name: label });
    this.menu = page.getByRole('menu', { name: label });
  }

  /** An option in the menu. Visible only while the menu is open. */
  option(name: ThemeOptionName): Locator {
    return this.menu.getByRole('menuitemradio', { name, exact: true });
  }

  /** Opens the menu and picks an option with the mouse. */
  async choose(name: ThemeOptionName) {
    await this.button.click();
    await this.option(name).click();
  }

  /** Starts every page load with `theme` already chosen, as if picked on an earlier visit. */
  async rememberChoice(theme: 'light' | 'dark') {
    await this.page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [themeStorageKey, theme],
    );
  }
}
