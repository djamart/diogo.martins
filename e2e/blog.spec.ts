import { expect, test } from '@playwright/test';
import { formatPostDate, isoDate, postPath } from '../src/blog/posts';
import { languageTags, ui } from '../src/i18n/ui';
import { themes } from '../src/styles/tokens';
import { BlogPage, expectedIndex } from './pages/BlogPage';
import { PostPage, postLabel, postPages } from './pages/PostPage';
import { SitePage } from './pages/SitePage';

/** A hex colour as the browser reports a computed colour. */
function rgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

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
        const summary = blog.summary(index);

        await expect(summary.link).toContainText(post.data.title);
        await expect(summary.link).toHaveAttribute('href', new RegExp(`/${postPath(slug)}/$`));
        if (postLang !== lang) {
          await expect(summary.link).toContainText(ui[lang][`blog.inLang.${postLang}`]);
          await expect(summary.link).toHaveAttribute('hreflang', languageTags[postLang]);
        }
        await expect(summary.date).toHaveAttribute('datetime', isoDate(post.data.pubDate));
        await expect(summary.date).toHaveText(formatPostDate(post.data.pubDate, lang));
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
      const feed = await blog.parseFeed(await response.text());
      expect(feed.parsed).toBe(true);
      expect(feed.language).toBe(languageTags[lang]);
      expect(feed.items).toEqual(expectedIndex(lang).map(({ post }) => post.data.title));
    });

    test(`every page tells feed readers where the blog feed is (${lang})`, async ({ page }) => {
      const site = new SitePage(page, lang);
      await site.goto('about');

      await expect(site.head.feed).toHaveAttribute(
        'href',
        new RegExp(`/${lang === 'en' ? '' : 'pt/'}blog/rss\\.xml$`),
      );
      await expect(site.head.feed).toHaveAttribute('title', ui[lang]['blog.feedTitle']);
    });
  }

  for (const post of postPages) {
    test(`${postLabel(post)} opens from the blog index and leads back to it`, async ({ page }) => {
      const blog = new BlogPage(page, post.lang);
      const postPage = new PostPage(page, post);
      await blog.goto();

      await blog.postLink(post.title).click();

      await expect(postPage.heading).toHaveText(post.title);
      await expect(postPage.date).toBeVisible();
      await expect(postPage.readingTime).toHaveText(
        new RegExp(ui[post.lang]['blog.readingTime'].replace('{minutes}', '\\d+')),
      );
      await postPage.backLink.click();
      await expect(blog.heading).toHaveText(ui[post.lang]['blog.title']);
    });

    test(`${postLabel(post)} switches language to its translation, or to the other blog`, async ({
      page,
    }) => {
      const postPage = new PostPage(page, post);
      const other = post.lang === 'en' ? 'pt' : 'en';
      const response = await postPage.goto();
      expect(response?.status()).toBe(200);

      await postPage.header.languageMenu.choose(other);

      await expect(postPage.root).toHaveAttribute('lang', languageTags[other]);
      if (post.translations.includes(other)) {
        await expect(page).toHaveURL(new RegExp(`/${postPath(post.slug)}/$`));
        await expect(postPage.article).toBeVisible();
      } else {
        await expect(postPage.heading).toHaveText(ui[other]['blog.title']);
      }
    });

    for (const colorScheme of ['light', 'dark'] as const) {
      test(`${postLabel(post)} shows its section headings in the text colour, not the accent (${colorScheme} theme)`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme });
        const postPage = new PostPage(page, post);
        await postPage.goto();

        for (const sectionHeading of await postPage.sectionHeadings.all()) {
          await expect(sectionHeading).toHaveCSS('color', rgb(themes[colorScheme].text));
        }
      });
    }

    test(`${postLabel(post)} lists only the languages it exists in`, async ({ page }) => {
      const postPage = new PostPage(page, post);
      await postPage.goto();

      await expect(postPage.head.translations).toHaveCount(post.translations.length);
      for (const lang of post.translations) {
        await expect(postPage.head.alternate(languageTags[lang])).toHaveAttribute(
          'href',
          new RegExp(`/${postPath(post.slug)}/$`),
        );
      }
    });
  }
});
