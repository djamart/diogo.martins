import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import {
  blogIndex,
  loadPostFiles,
  parsePostId,
  postLanguages,
  published,
} from '../../src/blog/posts';
import type { Lang } from '../../src/i18n/ui';

/** Every post in src/content/blog, drafts included, read the way the build reads them. */
export const allPosts = loadPostFiles(join(process.cwd(), 'src', 'content', 'blog'));

/** Every published post page in every language: each one gets the same tests as a menu page. */
export const postPages = published(allPosts).map((post) => {
  const { lang, slug } = parsePostId(post.id);
  return { lang, slug, title: post.data.title, translations: postLanguages(allPosts, slug) };
});

export type PostPageInfo = (typeof postPages)[number];

/** How a post reads in a test name: "Post “Title”", or "Post “Título” (pt)" for a translation. */
export function postLabel({ lang, title }: PostPageInfo): string {
  return lang === 'en' ? `Post “${title}”` : `Post “${title}” (${lang})`;
}

/** The posts the blog index of `lang` lists, newest first. */
export function expectedIndex(lang: Lang) {
  return blogIndex(allPosts, lang);
}

/** The blog index and the post pages of one language. */
export class BlogPage {
  readonly posts: Locator;
  readonly empty: Locator;
  readonly feedLink: Locator;
  readonly post: Locator;
  readonly backLink: Locator;

  constructor(
    private readonly page: Page,
    readonly lang: Lang = 'en',
  ) {
    this.posts = page.getByTestId('post-summary');
    this.empty = page.getByTestId('blog-empty');
    this.feedLink = page.getByTestId('link-rss');
    this.post = page.getByTestId('post');
    this.backLink = page.getByTestId('link-blog');
  }

  private get prefix() {
    return this.lang === 'en' ? './' : `./${this.lang}/`;
  }

  async goto() {
    return this.page.goto(`${this.prefix}blog/`);
  }

  async gotoPost(slug: string) {
    return this.page.goto(`${this.prefix}blog/${slug}/`);
  }

  feedUrl() {
    return `${this.prefix}blog/rss.xml`;
  }
}
