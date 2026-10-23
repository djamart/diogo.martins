---
name: write-unit-test
description: Add or change Vitest unit tests for logic in src/ (data rules, i18n, URL helpers, colour contrast, the CV model and PDF). Use when a change adds or modifies TypeScript logic, or when coverage drops below 80%.
---

# Write a unit test

Unit tests are the fastest and most precise level. Anything that can be decided without a browser is tested here: formatting, ordering, URL building, translation fallbacks, contrast ratios, what the CV contains.

## 1. Make the logic testable

Logic belongs in a `.ts` module under `src/`, not inside an `.astro` frontmatter block. If you are about to write a condition, a loop or a string transformation in a page, move it into `src/utils/`, `src/data/`, `src/i18n/` or `src/cv/` as a pure function and import it from the page. Coverage is measured over `src/**/*.ts` only.

## 2. Find or create the test file

One test file per module, mirroring its name: `src/utils/nav.ts` → `tests/unit/nav.test.ts`. Shared test helpers go in `tests/unit/helpers/` (for example `pdfText.ts` reads text back out of a PDF).

## 3. Write the tests

```ts
import { describe, expect, it } from 'vitest';
import { formatPeriod } from '../../src/data/profile';

describe('formatPeriod', () => {
  it('shows "present" for the current role', () => {
    expect(formatPeriod({ start: '2026-07' })).toBe('Jul 2026 – present');
  });
});
```

- `describe` names the function or module; `it` states the behaviour in plain English.
- Cover the normal case, the edges (empty, boundaries, trailing slash or not) and the errors. Assert error messages with a regex: `toThrow(/expected YYYY-MM/)`.
- Use `it.each` / `describe.each` for tables of cases, as `contrast.test.ts` does for every theme and colour pair.
- Test content rules against the data, not against copies of it: compare with `experience`, `contactLinks` or `ui.en` so the test follows the source of truth.
- Encode the content rules from `CLAUDE.md` as tests where they can break, e.g. "never shows a phone number or a CVE identifier" in `cv.test.ts`.
- Add a message to assertions inside loops so a failure names the case: `expect(value, key).not.toBe('')`.
- No mocks unless a dependency is slow or non-deterministic. Most code here is pure; call it directly.

## 4. Run it

```sh
npx vitest run tests/unit/nav.test.ts   # one file while iterating
npm run test:coverage                   # all tests and the 80% thresholds
```

Check the test fails for the right reason: break the function or the expected value once and read the failure message. If coverage is below 80%, add tests for the uncovered branches listed in the report; never lower the threshold or exclude files to pass.

## 5. Before you finish

`npm run lint`, `npm run format:check` and `npm run check` pass, and there is no `it.only` or `it.skip` left behind.
