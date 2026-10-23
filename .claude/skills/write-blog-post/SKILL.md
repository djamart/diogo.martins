---
name: write-blog-post
description: Add a blog post in English, European Portuguese or both, with the checks it needs to ship. Use when asked to write, translate or publish a post on the blog.
---

# Write a blog post

A post is done when it builds in every language it is written in, appears in the blog index and the feed, and passes the same gates as any page. The tests for post pages are generated from the files, so a post needs no new test, only its Lighthouse entry.

## 1. The file

Create `src/content/blog/<lang>/<slug>.md`, `en` or `pt`. For a translation, use the same slug in the other folder: that is what links the two versions in the language menu and `hreflang`.

```md
---
title: How this site is tested
description: One or two sentences for the blog index, the feed and search results.
pubDate: 2026-10-23
---
```

- `slug`: lowercase English words joined by hyphens, also for the Portuguese version, so both share one slug.
- `pubDate`: the day it goes live, `YYYY-MM-DD`. Add `updatedDate` for a later meaningful change.
- `draft: true` keeps a post off the site, the feed and the tests; remove it to publish.
- The title is the page's `<h1>`. Sections start at `##`, without skipping levels.
- One field per line in the frontmatter: `loadPostFiles` in `src/blog/posts.ts` reads it without a YAML parser.

## 2. The content

- Follow the content rules in `CLAUDE.md`: no phone number, CVEs without their identifiers, the "Quality Enablement Engineer" title.
- Portuguese is pt-PT (ecrã, ficheiro, equipa), never pt-BR.
- Code blocks wrap instead of scrolling, so long commands stay readable at 320 px; keep them short anyway.
- Images need alt text that says what the image shows. Prefer text and code to screenshots of them.
- Link with relative paths to other pages of the site only when they exist in the post's language.

## 3. Lighthouse

Add the post's URL to `collect.url` in `lighthouserc.json`, after the menu pages: English posts first, then Portuguese, each in file name order (`/diogo.martins/blog/<slug>/`, `/diogo.martins/pt/blog/<slug>/`). `tests/unit/quality.test.ts` lists the exact URLs it expects when one is missing.

## 4. Verify

```sh
npm run lint && npm run format:check && npm run check
npm run test:coverage
npm run build && npm run test:e2e -- --project=chromium --grep "Blog|Post|Accessibility"
npm run test:lighthouse && npm run test:links
```

`e2e/blog.spec.ts` checks the index order, the feed, the language menu and the `hreflang` of every post; `accessibility.spec.ts` and `mobile.spec.ts` scan each post. Read the post in `npm run dev` in both themes and at a phone width before opening the pull request.
