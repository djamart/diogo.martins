import type { Locator, Page } from '@playwright/test';
import { blogIndex } from '../../src/blog/posts';
import type { Lang } from '../../src/i18n/ui';
import { allPosts } from './PostPage';
import { SitePage } from './SitePage';

/** The posts the blog index of `lang` lists, newest first. */
export function expectedIndex(lang: Lang) {
  return blogIndex(allPosts, lang);
}

/** What a feed reader finds in a blog feed. */
export interface Feed {
  parsed: boolean;
  language: string | null | undefined;
  items: (string | null)[];
}

/** One post in the blog index: its title, linking to the post, and its date. */
export class PostSummary {
  readonly link: Locator;
  readonly date: Locator;

  constructor(readonly root: Locator) {
    this.link = root.getByRole('heading', { level: 2 }).getByRole('link');
    // A <time> element has no role; its datetime attribute is what machines read.
    this.date = root.locator('time');
  }
}

/** The blog index of one language. */
export class BlogPage extends SitePage {
  protected override readonly path = 'blog';
  readonly posts: Locator;
  readonly empty: Locator;
  readonly feedLink: Locator;

  constructor(page: Page, lang: Lang = 'en') {
    super(page, lang);
    this.posts = page.getByTestId('post-summary');
    this.empty = page.getByTestId('blog-empty');
    this.feedLink = page.getByTestId('link-rss');
  }

  /** The post at `index` in the list, from the newest. */
  summary(index: number): PostSummary {
    return new PostSummary(this.posts.nth(index));
  }

  /** The link to a post in the list, by its title. */
  postLink(title: string): Locator {
    return this.page.getByRole('link', { name: title });
  }

  /** Reads an RSS document the way a feed reader would, with the browser's XML parser. */
  async parseFeed(xml: string): Promise<Feed> {
    return this.page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, 'application/xml');
      return {
        parsed: doc.querySelector('parsererror') === null,
        language: doc.querySelector('channel > language')?.textContent,
        items: [...doc.querySelectorAll('item > title')].map((title) => title.textContent),
      };
    }, xml);
  }
}
