---
name: investigate-failing-test
description: Diagnose a failing or flaky test in CI or locally and find whether the product, the test or the environment is wrong, without weakening the test. Use when a CI check is red or a test passes only sometimes.
---

# Investigate a failing test

A red test is information. The goal is to find out what it is telling you, not to make it green.

## 1. Read the failure

- CI: open the failing job in the pull request checks. The E2E jobs upload a `playwright-report-<browser>` artifact with the HTML report, and a trace for any test that was retried. The quality job uploads `coverage-report`.
- Note which gate failed (lint, format, types, unit, coverage, E2E), which test, which browser, and the exact assertion message.

## 2. Reproduce

Run the narrowest command that shows the failure:

```sh
npx vitest run tests/unit/<file>.test.ts
npm run build && npx playwright test e2e/<file>.spec.ts --project=<browser> -g "<test name>"
```

E2E tests run against the production build, so rebuild after changing `src/`. To check the live site instead: `BASE_URL=https://djamart.github.io/diogo.martins/ npx playwright test --project=chromium`.

For a suspected flake, repeat it: `npx playwright test <file> --project=<browser> --repeat-each=20`. Open traces with `npx playwright show-trace <trace.zip>`.

## 3. Classify

| It fails because…                                                                                  | Then                                                                                                    |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| The product is wrong                                                                               | It is a bug: follow `fix-bug-with-test`. The failing test is already your reproduction.                 |
| The behaviour changed on purpose (new content, new layout)                                         | Update the test to the new intended behaviour, and say in the pull request why the expectation changed. |
| The test is brittle (CSS selector, fixed wait, order dependence, exact text that is not a promise) | Rewrite it with a role locator, a web-first assertion, or an independent setup.                         |
| One browser only                                                                                   | Check for a real browser difference (focus handling, downloads, fonts) before assuming flakiness.       |
| The environment (browser install, network, CI outage)                                              | Fix or report the environment. Do not change the test.                                                  |

## 4. Never

- Add `test.skip`, `test.fixme` or `.only`, or delete the test, to get green.
- Add `waitForTimeout` or raise timeouts to hide a race.
- Loosen an assertion (`toContainText` instead of `toHaveText`, a broader regex) unless the stricter version asserted something that is not a real promise.
- Lower the coverage threshold or filter axe violations.
- Rely on CI retries: a test that only passes on retry is flaky and must be fixed.

If a test cannot be fixed now, leave it failing and explain why in the pull request so the decision is visible.

## 5. Close the loop

Write the root cause in one sentence in the pull request or commit message. If the cause could affect other tests (a shared page object, a pattern copied across specs), fix them in the same change.
