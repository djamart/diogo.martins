/** One post in a feed. Links are absolute URLs. */
export interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: Date;
}

export interface Feed {
  title: string;
  description: string;
  /** The blog index the feed belongs to, as an absolute URL. */
  link: string;
  /** The feed's own absolute URL. */
  self: string;
  /** A BCP 47 tag, e.g. "pt-PT". */
  language: string;
  items: FeedItem[];
}

/** Escapes text for an XML element or attribute. */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** An RSS 2.0 document for `feed`, with items in the order given. */
export function rssXml(feed: Feed): string {
  const element = (name: string, value: string) => `<${name}>${escapeXml(value)}</${name}>`;
  const items = feed.items.map((item) =>
    [
      '<item>',
      element('title', item.title),
      element('link', item.link),
      `<guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
      element('description', item.description),
      element('pubDate', item.pubDate.toUTCString()),
      '</item>',
    ].join(''),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    element('title', feed.title),
    element('description', feed.description),
    element('link', feed.link),
    `<atom:link href="${escapeXml(feed.self)}" rel="self" type="application/rss+xml"/>`,
    element('language', feed.language),
    ...items,
    '</channel>',
    '</rss>',
  ].join('\n');
}
