# Debugging and Flaky Tests

A red test is a question, not a verdict. Playwright records what the browser actually did, and your job is to answer the question before you change a single line: is this a real product bug, a bug in the test itself, an environment or data problem, or genuine nondeterminism? Classification is the skill. The fix follows from it.

## Read the failure output before you open anything else

A failed run already prints most of what you need:

```
  1) cart.spec.ts:26:5 › promo code shows the discount › applies percent discount

  Error: expect(received).toHaveText(expected)

  Expected string: "-10.00"
  Received string: "0.00"

  Call log:
    - expect.toHaveText with timeout 5000ms
    - waiting for locator('[data-testid="discount"]')
    - locator resolved to <span data-testid="discount">0.00</span>
    - unexpected value "0.00"

    24 |   await page.getByRole('button', { name: 'Apply' }).click();
    25 |
  > 26 |   await expect(page.getByTestId('discount')).toHaveText('-10.00');
```

Three facts live in that block: what was expected, what the app produced, and where. The call log is the most underused part. It shows whether the locator resolved at all, and what it resolved to. A locator that never resolved and a locator that resolved to the wrong value are different failures with different owners.

## Turn on the interactive tooling

Slow the run down and watch the browser work:

```bash
npx playwright test --debug                 # Inspector: step through, try selectors live
npx playwright test --debug cart.spec.ts
npx playwright test --debug --last-failed   # only the tests that failed in the previous run
```

Inside a test, `await page.pause()` opens the same Inspector at that exact line. `--debug` is interactive and belongs on your machine, not in a committed test.

For a captured run with no browser window:

```bash
npx playwright test --trace on
npx playwright show-trace test-results/<test-name>/trace.zip
```

## Trace viewer: the black box recorder

Record traces where you need them — they are heavy. The usual CI setting:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    trace: 'retain-on-failure',      // 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  retries: process.env.CI ? 2 : 0,
});
```

`retain-on-failure` writes a trace for each failing test and discards the passing ones — the right default for CI. A trace gives you a scrubbable timeline of every action with before/after DOM snapshots, network requests with status codes, console messages, page source, and the exact locator each action used.

Open `trace.zip` and walk it in this order:

1. Jump to the failing step, then read the **Before** snapshot. Was the element in the DOM at all?
2. Check the network rows for that step. Did the request return 4xx or 5xx, or never fire?
3. Read the console for an uncaught error that happened before the assertion.
4. Look at the locator in the source tab. If it matched more than one element, the snapshot shows which one won.

## Flakiness: a failure that will not repeat

A flaky test passes and fails on the same code. That is a defect in the suite, not a nuisance to rerun. Retries are a measuring instrument and a temporary shield: they turn a hard failure into a soft one and never repair the cause. Collect them, count them, fix them.

The usual causes, roughly by frequency:

- **Race conditions.** The assertion runs before the app settles. The honest fix is a web-first assertion that retries: `await expect(page.getByRole('status')).toHaveText('Saved')` polls until the timeout. A fixed `page.waitForTimeout(2000)` makes the suite slower and still fails on a loaded machine.
- **Order dependence.** One test mutates data another test relies on. Symptom: every test passes alone, the file fails together. Run `npx playwright test --workers=1` and watch the failures surface.
- **Shared mutable state.** Module-level variables, one shared account, a seeded row that a test deletes.
- **Data collisions.** Two tests claiming the same email or ID, or parallel workers fighting over the same record.
- **Time and locale.** A test asserting today's date, or a currency and number format that no one promised.
- **Animation.** A component mid-transition is not clickable. Wait for the state, not for the clock.

## A triage protocol you can defend in review

1. **Reproduce deliberately.** `npx playwright test --repeat-each=5` for suspected flakiness, `--last-failed` to re-run only the failures after a change, `--workers=1` to separate order effects from real races.
2. **Never re-run to green.** A green rerun with no diagnosis is a postponed bug report.
3. **Classify, with evidence.** Product bug, test bug, environment or data problem, order dependence — and name the evidence that decided it: a snapshot, a network status, a console line, a source row.
4. **Fix at the right level.** A real product bug becomes a bug report with the trace attached. A test bug is a corrected expectation or locator. An environment problem is a fixture and a seed that do not lie.
5. **Verify the fix fails for the right reason.** After changing a test, break the app on purpose and confirm the test goes red. A test that passes while asserting nothing is worse than a flaky one.

## Reporting a failing test

Write for a developer who does not run your suite:

- test name, file and line, and the command that reproduces it;
- classification and the evidence behind it;
- the trace file path, or the relevant snapshot and network row pasted in;
- for a product bug: expected, received, and the smallest reproduction;
- for a test bug: what the test asserted and what the product actually promises.

## What to carry into the practice task

In the practice task a small app is scaffolded inside your own repository with a planted timing issue and four failing Playwright tests. One failure is a real product bug, one is a wrong expectation, one is an environment or data problem, and one fails only when the file runs in order. Classify all four from the trace, fix each at the right level, and prove every fix.
