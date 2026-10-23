import type { Locator, Page } from '@playwright/test';
import { ui, type Lang } from '../../../src/i18n/ui';

/** How each language is named in the language menu: in that language. */
export const languageNames = { en: 'English', pt: 'Português' } as const satisfies Record<
  Lang,
  string
>;

/** The language menu in the header: a button with the current language's short name. */
export class LanguageMenu {
  readonly button: Locator;
  readonly menu: Locator;

  constructor(page: Page, lang: Lang) {
    this.button = page.getByRole('button', {
      name: `${ui[lang]['language.label']}: ${lang.toUpperCase()}`,
    });
    this.menu = page.getByTestId('language-menu').getByRole('list');
  }

  /** A language in the menu, named in that language. Visible only while the menu is open. */
  option(lang: Lang): Locator {
    return this.menu.getByRole('link', { name: languageNames[lang], exact: true });
  }

  /** Opens the menu and picks a language with the mouse. */
  async choose(lang: Lang) {
    await this.button.click();
    await this.option(lang).click();
  }
}
