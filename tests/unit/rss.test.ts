import { describe, expect, it } from 'vitest';
import { escapeXml, rssXml, type Feed } from '../../src/blog/rss';

const feed: Feed = {
  title: 'Diogo Martins: blog',
  description: 'Notes on testing.',
  link: 'https://djamart.github.io/diogo.martins/blog/',
  self: 'https://djamart.github.io/diogo.martins/blog/rss.xml',
  language: 'en',
  items: [
    {
      title: 'Tests & <gates>',
      link: 'https://djamart.github.io/diogo.martins/blog/gates/',
      description: 'Why "green" matters.',
      pubDate: new Date('2026-10-23'),
    },
  ],
};

describe('escapeXml', () => {
  it('escapes the characters XML reserves', () => {
    expect(escapeXml(`a & b < c > d "e" 'f'`)).toBe(
      'a &amp; b &lt; c &gt; d &quot;e&quot; &apos;f&apos;',
    );
  });
});

describe('rssXml', () => {
  const xml = rssXml(feed);

  it('describes the channel with its language and its own address', () => {
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
    expect(xml).toContain('<title>Diogo Martins: blog</title>');
    expect(xml).toContain('<link>https://djamart.github.io/diogo.martins/blog/</link>');
    expect(xml).toContain(
      '<atom:link href="https://djamart.github.io/diogo.martins/blog/rss.xml" rel="self" type="application/rss+xml"/>',
    );
    expect(xml).toContain('<language>en</language>');
  });

  it('lists each post with an escaped title, a permanent link and an RFC 822 date', () => {
    expect(xml).toContain('<title>Tests &amp; &lt;gates&gt;</title>');
    expect(xml).toContain(
      '<guid isPermaLink="true">https://djamart.github.io/diogo.martins/blog/gates/</guid>',
    );
    expect(xml).toContain('<description>Why &quot;green&quot; matters.</description>');
    expect(xml).toContain('<pubDate>Fri, 23 Oct 2026 00:00:00 GMT</pubDate>');
  });

  it('is a valid feed with no items when there are no posts', () => {
    const empty = rssXml({ ...feed, items: [] });
    expect(empty).not.toContain('<item>');
    expect(empty).toContain('</channel>\n</rss>');
  });
});
