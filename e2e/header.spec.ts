import { expect, test } from '@playwright/test';
import { headerOpacity, themes } from '../src/styles/tokens';
import { SitePage } from './pages/SitePage';

/** A theme's page background, see-through as the header shows it, as the browser reports it. */
function headerBackground(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${headerOpacity})`;
}

const transparent = 'rgba(0, 0, 0, 0)';

test.describe('Sticky header', () => {
  test('lies flat on the page before it scrolls', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('about');

    await expect(site.header.bar).toHaveCSS('background-color', transparent);
    await expect(site.header.bar).toHaveCSS('box-shadow', 'none');
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`stays in view, see-through and with a shadow, once the page scrolls (${colorScheme} theme)`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      const site = new SitePage(page);
      await site.goto('about');

      await site.scrollDown();

      await expect(site.header.bar).toBeInViewport({ ratio: 1 });
      await expect(site.header.nav).toBeVisible();
      await expect(site.header.bar).toHaveCSS(
        'background-color',
        headerBackground(themes[colorScheme].bg),
      );
      await expect(site.header.bar).not.toHaveCSS('box-shadow', 'none');
      await expect(site.header.bar).toHaveCSS('backdrop-filter', /blur/);
    });
  }

  test('goes flat again when the page is back at the top', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('about');
    await site.scrollDown();
    await expect(site.header.bar).not.toHaveCSS('box-shadow', 'none');

    await site.scrollToTop();

    await expect(site.header.bar).toHaveCSS('background-color', transparent);
    await expect(site.header.bar).toHaveCSS('box-shadow', 'none');
  });

  test('eases its shadow in, unless the visitor prefers reduced motion', async ({ page }) => {
    const site = new SitePage(page);
    await site.goto('about');
    await expect(site.header.bar).toHaveCSS('transition-duration', '0.2s, 0.2s');

    await page.emulateMedia({ reducedMotion: 'reduce' });

    await expect(site.header.bar).toHaveCSS('transition-duration', '0s');
  });
});
