import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts live in src/content/blog/<lang>/<slug>.md. The same slug in two languages is one post
// in two languages; a post may exist in one language only. Helpers are in src/blog/posts.ts.
const blog = defineCollection({
  loader: glob({ pattern: '{en,pt}/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
