import { expect, test } from '@playwright/test';
import { contactLinks } from '../src/data/profile';
import { themes } from '../src/styles/tokens';
import { SitePage } from './pages/SitePage';

/** A hex colour as the browser reports a computed background. */
function rgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

const email = contactLinks.find((link) => link.id === 'email')!;

test.describe('Footer', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`a contact link changes its background on hover, without an underline (${colorScheme} theme)`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      const site = new SitePage(page);
      await site.goto();
      const { footer } = site;

      await expect(footer.email).toHaveCSS('background-color', rgb(themes[colorScheme].surface));

      await footer.email.hover();

      await expect(footer.email).toHaveCSS(
        'background-color',
        rgb(themes[colorScheme].surfaceHover),
      );
      await expect(footer.labelOf(footer.email, email.label)).toHaveCSS(
        'text-decoration-line',
        'none',
      );
    });
  }
});
