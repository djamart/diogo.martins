import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  blogIndex,
  formatPostDate,
  isoDate,
  loadPostFiles,
  parsePostId,
  postLanguages,
  postPath,
  published,
  readingMinutes,
  type Post,
} from '../../src/blog/posts';

function post(id: string, pubDate: string, overrides: Partial<Post['data']> = {}): Post {
  return {
    id,
    data: {
      title: id,
      description: `About ${id}`,
      pubDate: new Date(pubDate),
      draft: false,
      ...overrides,
    },
  };
}

describe('parsePostId', () => {
  it('reads the language from the folder and the slug from the file name', () => {
    expect(parsePostId('en/how-this-site-is-tested')).toEqual({
      lang: 'en',
      slug: 'how-this-site-is-tested',
    });
    expect(parsePostId('pt/ola')).toEqual({ lang: 'pt', slug: 'ola' });
  });

  it('rejects a post outside a language folder', () => {
    expect(() => parsePostId('fr/bonjour')).toThrow(/src\/content\/blog\/<language>/);
    expect(() => parsePostId('hello')).toThrow(/src\/content\/blog\/<language>/);
  });
});

describe('postPath', () => {
  it('puts posts under blog/', () => {
    expect(postPath('hello')).toBe('blog/hello');
  });
});

describe('published', () => {
  it('leaves drafts out', () => {
    const posts = [post('en/a', '2026-10-01'), post('en/b', '2026-10-02', { draft: true })];
    expect(published(posts).map((p) => p.id)).toEqual(['en/a']);
  });
});

describe('postLanguages', () => {
  const posts = [
    post('pt/both', '2026-10-01'),
    post('en/both', '2026-10-01'),
    post('en/english', '2026-10-02'),
    post('pt/english', '2026-10-02', { draft: true }),
  ];

  it('lists the languages of a post in menu order', () => {
    expect(postLanguages(posts, 'both')).toEqual(['en', 'pt']);
  });

  it('does not count a draft translation', () => {
    expect(postLanguages(posts, 'english')).toEqual(['en']);
  });
});

describe('blogIndex', () => {
  const posts = [
    post('en/old', '2026-01-10'),
    post('pt/old', '2026-01-10'),
    post('en/english-only', '2026-03-01'),
    post('pt/portuguese-only', '2026-02-01'),
    post('en/draft', '2026-12-01', { draft: true }),
  ];

  it('lists every published post once, newest first', () => {
    expect(blogIndex(posts, 'en').map((entry) => entry.slug)).toEqual([
      'english-only',
      'portuguese-only',
      'old',
    ]);
  });

  it('shows each post in the visitor language when it has that translation', () => {
    expect(blogIndex(posts, 'pt').map((entry) => entry.post.id)).toEqual([
      'en/english-only',
      'pt/portuguese-only',
      'pt/old',
    ]);
    expect(blogIndex(posts, 'en').find((entry) => entry.slug === 'old')?.lang).toBe('en');
  });

  it('orders posts from the same day by title', () => {
    const sameDay = [
      post('en/b', '2026-05-01', { title: 'Beta' }),
      post('en/a', '2026-05-01', { title: 'Alpha' }),
    ];
    expect(blogIndex(sameDay, 'en').map((entry) => entry.post.data.title)).toEqual([
      'Alpha',
      'Beta',
    ]);
  });

  it('is empty when there are no posts', () => {
    expect(blogIndex([], 'pt')).toEqual([]);
  });
});

describe('formatPostDate', () => {
  it('writes the date the way readers of each language do', () => {
    const date = new Date('2026-10-23');
    expect(formatPostDate(date, 'en')).toBe('23 October 2026');
    expect(formatPostDate(date, 'pt')).toBe('23 de outubro de 2026');
  });

  it('shows the day of the frontmatter date in any time zone', () => {
    expect(formatPostDate(new Date('2026-01-01'), 'en')).toBe('1 January 2026');
  });
});

describe('isoDate', () => {
  it('returns the day as YYYY-MM-DD', () => {
    expect(isoDate(new Date('2026-10-23'))).toBe('2026-10-23');
  });
});

describe('readingMinutes', () => {
  it('counts 200 words a minute', () => {
    expect(readingMinutes(Array(1000).fill('word').join(' '))).toBe(5);
  });

  it('never says less than one minute', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('A short note.')).toBe(1);
  });
});

describe('loadPostFiles', () => {
  const dir = mkdtempSync(join(tmpdir(), 'blog-'));
  mkdirSync(join(dir, 'en'));
  mkdirSync(join(dir, 'pt'));
  writeFileSync(
    join(dir, 'en', 'hello.md'),
    '---\ntitle: "Hello: world"\ndescription: A first post.\npubDate: 2026-10-23\n---\n\nHi.',
  );
  writeFileSync(
    join(dir, 'pt', 'ola.md'),
    "---\ntitle: 'Olá'\ndescription: Um rascunho.\npubDate: 2026-10-24\ndraft: true\n---\n",
  );
  writeFileSync(join(dir, 'pt', 'notes.txt'), 'not a post');

  it('reads every Markdown post in every language folder', () => {
    expect(loadPostFiles(dir)).toEqual([
      {
        id: 'en/hello',
        data: {
          title: 'Hello: world',
          description: 'A first post.',
          pubDate: new Date('2026-10-23'),
          draft: false,
        },
      },
      {
        id: 'pt/ola',
        data: {
          title: 'Olá',
          description: 'Um rascunho.',
          pubDate: new Date('2026-10-24'),
          draft: true,
        },
      },
    ]);
  });

  it('returns no posts when there are no language folders', () => {
    expect(loadPostFiles(join(dir, 'missing'))).toEqual([]);
  });

  it('rejects a post without a title or a date', () => {
    const broken = mkdtempSync(join(tmpdir(), 'blog-'));
    mkdirSync(join(broken, 'en'));
    writeFileSync(join(broken, 'en', 'untitled.md'), '---\npubDate: 2026-10-23\n---\n');
    expect(() => loadPostFiles(broken)).toThrow(/en\/untitled\.md needs a title and a pubDate/);
  });
});
