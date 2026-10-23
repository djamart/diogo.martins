import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultLang, languages, type Lang } from '../i18n/ui';

/** The frontmatter of a post in `src/content/blog/<lang>/<slug>.md` (schema in src/content.config.ts). */
export interface PostData {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  draft: boolean;
}

/** A post as the content collection returns it: `id` is "<lang>/<slug>". */
export interface Post {
  id: string;
  data: PostData;
  body?: string;
}

/** A post in the blog index of one language, which may be a post in another language. */
export interface IndexEntry {
  post: Post;
  lang: Lang;
  slug: string;
}

const allLangs = Object.keys(languages) as Lang[];

function isLang(value: string): value is Lang {
  return value in languages;
}

/** Splits a post id into its language and slug, e.g. "pt/hello" → { lang: "pt", slug: "hello" }. */
export function parsePostId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  const slug = rest.join('/');
  if (!isLang(lang) || slug === '') {
    throw new Error(`Post "${id}" must be in src/content/blog/<language>/, one of: ${allLangs}`);
  }
  return { lang, slug };
}

/** The path of a post relative to the site base and language prefix, what `pageHref` takes. */
export function postPath(slug: string): string {
  return `blog/${slug}`;
}

/** Posts a visitor can see: drafts stay in the repository until `draft` is removed. */
export function published(posts: Post[]): Post[] {
  return posts.filter((post) => !post.data.draft);
}

/** Newest first; posts from the same day by title, so the order never depends on file order. */
function byDate(a: Post, b: Post): number {
  return (
    b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.data.title.localeCompare(b.data.title)
  );
}

/** The published languages of the post at `slug`, in the order of the language menu. */
export function postLanguages(posts: Post[], slug: string): Lang[] {
  const langs = new Set(
    published(posts)
      .map((post) => parsePostId(post.id))
      .filter((post) => post.slug === slug)
      .map((post) => post.lang),
  );
  return allLangs.filter((lang) => langs.has(lang));
}

/**
 * The blog index of `lang`, newest first: every published post once, in `lang` when it has
 * that translation, otherwise in the default language, otherwise in the language it exists in.
 */
export function blogIndex(posts: Post[], lang: Lang): IndexEntry[] {
  const preference = [lang, defaultLang, ...allLangs];
  const bySlug = new Map<string, IndexEntry>();
  for (const post of published(posts)) {
    const entry = { post, ...parsePostId(post.id) };
    const current = bySlug.get(entry.slug);
    if (!current || preference.indexOf(entry.lang) < preference.indexOf(current.lang)) {
      bySlug.set(entry.slug, entry);
    }
  }
  return [...bySlug.values()].sort((a, b) => byDate(a.post, b.post));
}

/** British English, like the rest of the site, and European Portuguese. */
const dateLocales: Record<Lang, string> = { en: 'en-GB', pt: 'pt-PT' };

/** A post date as readers of `lang` write it, e.g. "23 October 2026" or "23 de outubro de 2026". */
export function formatPostDate(date: Date, lang: Lang): string {
  // Frontmatter dates are midnight UTC; any other time zone could show the day before.
  return new Intl.DateTimeFormat(dateLocales[lang], { dateStyle: 'long', timeZone: 'UTC' }).format(
    date,
  );
}

/** A date as `<time datetime>` and feeds expect it, e.g. "2026-10-23". */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Minutes to read `text` at 200 words a minute, never less than one. */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Reads every post under `blogDir` (`<lang>/<slug>.md`) without Astro, for the tests and checks
 * that must cover each post page. Reads only the frontmatter fields they need, one per line.
 */
export function loadPostFiles(blogDir: string): Post[] {
  return allLangs.flatMap((lang) => {
    let files: string[];
    try {
      files = readdirSync(join(blogDir, lang)).filter((file) => file.endsWith('.md'));
    } catch {
      return [];
    }
    return files.map((file) => {
      const markdown = readFileSync(join(blogDir, lang, file), 'utf8');
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1] ?? '';
      const field = (key: string) =>
        new RegExp(`^${key}:\\s*(.+)$`, 'm')
          .exec(frontmatter)?.[1]
          .trim()
          .replace(/^(['"])(.*)\1$/, '$2');
      const title = field('title');
      const pubDate = field('pubDate');
      if (!title || !pubDate) throw new Error(`Post ${lang}/${file} needs a title and a pubDate`);
      return {
        id: `${lang}/${file.replace(/\.md$/, '')}`,
        data: {
          title,
          description: field('description') ?? '',
          pubDate: new Date(pubDate),
          draft: field('draft') === 'true',
        },
      };
    });
  });
}
