import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { languageTags } from '../../../i18n/ui';
import { getLangFromUrl, localeStaticPaths, useTranslations } from '../../../i18n/utils';
import { blogIndex, postPath } from '../../../blog/posts';
import { rssXml } from '../../../blog/rss';
import { pageHref } from '../../../utils/nav';

export const getStaticPaths = localeStaticPaths;

/** The feed of the blog in one language: the same posts as its index, newest first. */
export const GET: APIRoute = async ({ url, site }) => {
  const base = import.meta.env.BASE_URL;
  const lang = getLangFromUrl(url, base);
  const t = useTranslations(lang);
  const absolute = (path: string) => new URL(path, site).href;
  const blog = pageHref(base, 'blog', lang);
  const items = blogIndex(await getCollection('blog'), lang).map(
    ({ post, lang: postLang, slug }) => ({
      title: post.data.title,
      link: absolute(pageHref(base, postPath(slug), postLang)),
      description: post.data.description,
      pubDate: post.data.pubDate,
    }),
  );

  const xml = rssXml({
    title: t('blog.feedTitle'),
    description: t('blog.intro'),
    link: absolute(blog),
    self: absolute(`${blog}rss.xml`),
    language: languageTags[lang],
    items,
  });
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
