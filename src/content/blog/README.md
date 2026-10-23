# Blog posts

One Markdown file per post and language: `en/<slug>.md` for English, `pt/<slug>.md` for European Portuguese. Use the same slug for the two languages of one post; a post may exist in one language only, and the blog index of the other language lists it with a note saying which language it is in.

```md
---
title: How this site is tested
description: One or two sentences for the blog index, the feed and search results.
pubDate: 2026-10-23
# updatedDate: 2026-11-02
# draft: true   # kept out of the site, the feed and the tests until removed
---

Start with the first paragraph; the title is the page heading. Use `##` and below for sections.
```

The schema is in `src/content.config.ts`. Follow the `write-blog-post` skill in `.claude/skills/` to add one.
