---
name: fix-bug-with-test
description: Fix a reported bug test-first, by reproducing it as a failing test, making the smallest fix, and keeping the test as a regression check. Use for any bug report or defect on this site.
---

# Fix a bug with a test

The defect policy in `docs/test-plan.md`: a fix comes with a test that fails before the fix and passes after it. The test is the proof that the bug existed and the guard that it does not come back.

## 1. Understand the report

From the bug report (template in `.github/ISSUE_TEMPLATE/bug_report.yml`), write down:

- steps to reproduce, expected result and actual result;
- the environment: page, browser, theme, viewport, local build or live site;
- the severity, which decides how far to go beyond the fix.

If the steps are not enough to reproduce it, reproduce it yourself (`npm run dev`, or the live site) before changing anything. If you still cannot, ask for the missing detail instead of guessing a fix.

## 2. Choose the test level

Find the lowest level where the bug can be seen:

- wrong output from a function, data in the wrong order, a bad URL → unit test (`write-unit-test`);
- something only visible in a browser (focus, navigation, a download, one browser only) → E2E test (`write-e2e-test`);
- an accessibility violation → it should already fail `accessibility.spec.ts`; if it does not, the page is probably missing from `sitePages` or the rule needs a targeted test.

## 3. Write the failing test

Name it after the correct behaviour, not the bug: `'marks home as current on the site root'`, not `'fix #42'`. Mention the issue number in the commit or pull request, not in the test name.

Run it and confirm it fails **for the reason in the report**. A test that fails for another reason (wrong locator, missing build) proves nothing.

## 4. Fix

Make the smallest change that makes the test pass. Do not refactor or tidy unrelated code in the same change; open a separate pull request for that.

## 5. Look for siblings

Ask where else the same mistake could be: other pages, other browsers, the CV that shares the same data. If a rule applies to every page, loop over `sitePages` in the test rather than testing one page.

## 6. Verify and record

- Run all gates (see `CLAUDE.md`). The new test passes, nothing else changed.
- In the pull request: link the issue (`Closes #123`), state the root cause in one sentence and name the test that now covers it.
- If the bug shows a risk the test plan does not list, add it to the risk table in `docs/test-plan.md`.
