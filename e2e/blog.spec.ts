import { expect, test } from '@playwright/test';
import { formatPostDate, isoDate, postPath } from '../src/blog/posts';
import { languageTags, ui } from '../src/i18n/ui';
import { BlogPage, expectedIndex, postLabel, postPages } from './pages/BlogPage';
import { SitePage } from './pages/SitePage';

// The post tests are generated from src/content/blog, so every new post is covered on its own.
test.describe('Blog', () => {
  for (const lang of ['en', 'pt'] as const) {
    test(`the blog index lists every post newest first, or says there are none yet (${lang})`, async ({
      page,
    }) => {
      const blog = new BlogPage(page, lang);
      const expected = expectedIndex(lang);
      await blog.goto();

      await expect(blog.posts).toHaveCount(expected.length);
      if (expected.length === 0) await expect(blog.empty).toHaveText(ui[lang]['blog.empty']);
      else await expect(blog.empty).toHaveCount(0);
      for (const [index, { post, lang: postLang, slug }] of expected.entries()) {
        const summary = blog.posts.nth(index);
        const link = summary.getByRole('heading', { level: 2 }).getByRole('link');

        await expect(link).toContainText(post.data.title);
        await expect(link).toHaveAttribute('href', new RegExp(`/${postPath(slug)}/$`));
        if (postLang !== lang) {
          await expect(link).toContainText(ui[lang][`blog.inLang.${postLang}`]);
          await expect(link).toHaveAttribute('hreflang', languageTags[postLang]);
        }
        await expect(summary.locator('time')).toHaveAttribute(
          'datetime',
          isoDate(post.data.pubDate),
        );
        await expect(summary.locator('time')).toHaveText(formatPostDate(post.data.pubDate, lang));
      }
    });

    test(`the blog feed is valid RSS with the same posts as the index (${lang})`, async ({
      page,
      request,
    }) => {
      const blog = new BlogPage(page, lang);
      await blog.goto();
      const href = await blog.feedLink.getAttribute('href');

      const response = await request.get(new URL(href!, page.url()).href);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toMatch(/xml/);
      const feed = await page.evaluate(
        (xml) => {
          const doc = new DOMParser().parseFromString(xml, 'application/xml');
          return {
            parsed: doc.querySelector('parsererror') === null,
            language: doc.querySelector('channel > language')?.textContent,
            items: [...doc.querySelectorAll('item > title')].map((title) => title.textContent),
          };
        },
        await response.text(),
      );
      expect(feed.parsed).toBe(true);
      expect(feed.language).toBe(languageTags[lang]);
      expect(feed.items).toEqual(expectedIndex(lang).map(({ post }) => post.data.title));
    });

    test(`every page tells feed readers where the blog feed is (${lang})`, async ({ page }) => {
      await new SitePage(page, lang).goto('about');
      // <link> elements in the head have no role; feed readers read their attributes.
      const feed = page.locator('link[rel="alternate"][type="application/rss+xml"]');

      await expect(feed).toHaveAttribute(
        'href',
        new RegExp(`/${lang === 'en' ? '' : 'pt/'}blog/rss\\.xml$`),
      );
      await expect(feed).toHaveAttribute('title', ui[lang]['blog.feedTitle']);
    });
  }

  for (const post of postPages) {
    test(`${postLabel(post)} opens from the blog index and leads back to it`, async ({ page }) => {
      const blog = new BlogPage(page, post.lang);
      const site = new SitePage(page, post.lang);
      await blog.goto();

      await page.getByRole('link', { name: post.title }).click();

      await expect(site.heading).toHaveText(post.title);
      await expect(blog.post.locator('.meta time').first()).toBeVisible();
      await expect(page.getByTestId('reading-time')).toHaveText(
        new RegExp(ui[post.lang]['blog.readingTime'].replace('{minutes}', '\\d+')),
      );
      await blog.backLink.click();
      await expect(site.heading).toHaveText(ui[post.lang]['blog.title']);
    });

    test(`${postLabel(post)} switches language to its translation, or to the other blog`, async ({
      page,
    }) => {
      const blog = new BlogPage(page, post.lang);
      const site = new SitePage(page, post.lang);
      const other = post.lang === 'en' ? 'pt' : 'en';
      const response = await blog.gotoPost(post.slug);
      expect(response?.status()).toBe(200);

      await site.chooseLanguage(other === 'en' ? 'English' : 'Português');

      await expect(page.locator('html')).toHaveAttribute('lang', languageTags[other]);
      if (post.translations.includes(other)) {
        await expect(page).toHaveURL(new RegExp(`/${postPath(post.slug)}/$`));
        await expect(blog.post).toBeVisible();
      } else {
        await expect(site.heading).toHaveText(ui[other]['blog.title']);
      }
    });

    test(`${postLabel(post)} lists only the languages it exists in`, async ({ page }) => {
      await new BlogPage(page, post.lang).gotoPost(post.slug);
      const alternates = page.locator(
        'link[rel="alternate"][hreflang]:not([hreflang="x-default"])',
      );

      await expect(alternates).toHaveCount(post.translations.length);
      for (const lang of post.translations) {
        await expect(
          page.locator(`link[rel="alternate"][hreflang="${languageTags[lang]}"]`),
        ).toHaveAttribute('href', new RegExp(`/${postPath(post.slug)}/$`));
      }
    });
  }
});
