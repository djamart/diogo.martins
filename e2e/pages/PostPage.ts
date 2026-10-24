import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { loadPostFiles, parsePostId, postLanguages, published } from '../../src/blog/posts';
import { SitePage } from './SitePage';

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

/** One of the published posts in `postPages`, in its language. */
export class PostPage extends SitePage {
  readonly article: Locator;
  /** When the post was published. */
  readonly date: Locator;
  readonly readingTime: Locator;
  readonly backLink: Locator;
  /** The headings that split the post into sections, below its title. */
  readonly sectionHeadings: Locator;

  constructor(
    page: Page,
    private readonly post: Pick<PostPageInfo, 'lang' | 'slug'>,
  ) {
    super(page, post.lang);
    this.article = page.getByTestId('post');
    // A <time> element has no role; the first one in the post's details is the publication date.
    this.date = this.article.locator('.meta time').first();
    this.readingTime = page.getByTestId('reading-time');
    this.backLink = page.getByTestId('link-blog');
    this.sectionHeadings = this.article.getByRole('heading', { level: 2 });
  }

  override async goto() {
    return this.page.goto(`${this.prefix}blog/${this.post.slug}/`);
  }
}
