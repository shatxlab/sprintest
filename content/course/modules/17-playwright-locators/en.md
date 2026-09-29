# Reviewing AI-Written Tests

An agent writes a Playwright spec in seconds. The bottleneck is no longer producing tests — it is deciding which of them deserve to merge. Merging a generated spec unread is how teams acquire suites that are green and worthless: they pass, they prove nothing, and they cost real effort to maintain. Reviewing is quicker to learn than writing, and it is the daily job of AI-era automation — but it is not skimming. Review needs vocabulary: what a locator promises, what an assertion proves, what a wait hides. This module gives you the checklist, the failure modes, and one seeded spec to practise on.

## The review checklist

Seven questions, asked per test, in this order:

1. Does every test assert observable behaviour? A test with no assertion is green on every version of the page, including the broken ones.
2. Does the test test the app, or a mock? If `page.route` intercepts the data the test claims to verify, the assertion checks the mock — the app could be absent.
3. Would the locator survive a refactor? Positional CSS chains and bare text selectors die on the first layout change or copy edit.
4. Is the assertion web-first or a one-shot read? `expect(locator).toHaveText(...)` retries until the condition holds; a captured `await el.textContent()` samples the DOM once and races the app.
5. Is any wait a guess? `waitForTimeout(2000)` is slow on fast machines and still too fast on slow ones — it encodes hope, not a condition.
6. Is the coverage new? Three tests over one behaviour add maintenance cost while saying nothing the first test did not say.
7. Would the test fail if the feature broke? Mutation thinking: break the behaviour on purpose and watch the test go red. This is the only real proof that a test is worth keeping.

Questions 1 and 7 catch the tests that are worse than missing: a missing test costs you coverage, a worthless one costs you every future run. Write your answers down as you go — they become your audit notes.

## How AI-written tests fail

Generated specs fail in predictable ways. Learn the symptom and the diagnosis together:

- **Invented selectors and fixtures.** Symptom: the spec references `data-testid="user-card"` or a helper `loginAs()` that does not exist in the repo. Diagnosis: the agent wrote plausible code against an imagined page. Run the spec first — nothing catches invention faster than a real run.
- **Tests that pass for the wrong reason.** Symptom: everything is green while a mock always says yes. Diagnosis: `page.route` replaced the subject of the test; the assertion verifies that the mocked response renders, never that the app's behaviour works.
- **One-shot reads racing the app.** Symptom: `await el.textContent()` followed by a plain `expect` — passes locally, fails in CI, and the failure diff is useless. Diagnosis: the read samples the DOM once, and the app was a few hundred milliseconds slower than the test.
- **Fixed sleeps.** Symptom: `waitForTimeout` before a click or an assertion. Diagnosis: the author could not name the condition to wait for and guessed a duration.
- **Retries hiding a race.** Symptom: a test that passes on the second attempt only. Diagnosis: `retries: 2` re-runs the race until the timing favours the test; the flake is real and the retry is a mask.
- **Exact-copy assertions.** Symptom: `toBe("Wireless Mouse 2")`. Diagnosis: the assertion binds the test to one wording, and the next copy edit breaks a green suite.
- **Duplicated coverage.** Symptom: two tests whose names differ and whose bodies say the same thing. Diagnosis: the agent optimised for quantity; keep one and delete the other.
- **Unused scaffolding.** Symptom: a fixture, helper or route handler no test references. Diagnosis: the agent hedged; dead code in a suite is a permanent tax.
- **Unrelated rewrites mixed into the diff.** Symptom: the change that adds coverage also reformats three untouched specs. Diagnosis: the agent drifted from its brief; split the diff and review the reformat separately, or drop it.
- **Green reported without a run.** Symptom: the summary says "all tests pass" and no command output backs it. Diagnosis: the agent predicts results. Every claim of green needs a run that you or the CI actually executed.

None of these failures look like failures in the agent's summary — every one of them reports green. That is the point of the whole module: the summary is a claim, and your review is the evidence.

## Locator vocabulary

The reviewer's condensed priority order:

1. `getByRole` — role plus accessible name: `getByRole("button", { name: "Sign in" })`.
2. `getByLabel`, `getByPlaceholder` — form fields by their visible label or placeholder.
3. `getByText` — non-interactive text content, such as a heading or a status message.
4. `getByTestId` — an explicit `data-testid` attribute, when no accessible name identifies the element reliably.
5. CSS and XPath — last resort, for cases the above genuinely cannot express.

Role and label locators depend on semantics, not implementation: a class rename or a new wrapper `div` leaves `getByRole("button", { name: "Sign in" })` untouched, while `div.card > form > button:nth-child(3)` breaks the moment a designer adds a paragraph above the button. In review, a positional chain is a finding on its own.

Strict mode is the vagueness detector: when a locator matches several elements, the call fails and names every match. Scoping and filtering turn that failure into precise queries — chain a container locator to narrow the search, and `filter({ hasText })` to narrow a collection without indexing:

```ts
const modal = page.getByRole("dialog");
await modal.getByRole("button", { name: "Close" }).click();

await page
  .getByRole("listitem")
  .filter({ hasText: "Wireless Mouse" })
  .getByRole("button", { name: "Add to cart" })
  .click();
```

`.first()` and `.nth(2)` are acceptable only when the order genuinely is the thing under test; elsewhere they hide the ambiguity strict mode just pointed at.

The example to internalise — a sign-in test a reviewer can accept as-is:

```ts
import { test, expect } from "@playwright/test";

test("sign in shows the account menu", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email").fill("qa@example.com");
  await page.getByLabel("Password").fill("secret");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("button", { name: "Account" })).toBeVisible();
});
```

Every locator is semantic, the waiting lives inside the assertion, and the test fails if sign-in breaks. That is what an acceptable generated test looks like.

## Assertion vocabulary

The everyday set: `toBeVisible`, `toBeHidden`, `toBeEnabled`, `toBeChecked`, `toHaveText` (string, regular expression, or array of strings), `toContainText`, `toHaveValue`, `toHaveCount`, `toHaveAttribute`, `toHaveClass`, plus `toHaveURL` and `toHaveTitle` on the page.

Web-first versus one-shot — the most common defect in generated tests, so keep this contrast at hand:

```ts
// one-shot: samples the DOM once, races the app, gives an unhelpful diff
const value = await page.getByLabel("Email").inputValue();
expect(value).toBe("qa@example.com");
```

```ts
// web-first: waits for the condition, reports expected and received on failure
await expect(page.getByLabel("Email")).toHaveValue("qa@example.com");
```

The one-shot form samples at a single moment. If the app fills the field 300 ms later, the test fails on a machine that is merely slower — and the failure text explains nothing. The web-first form waits for the condition and reports both values at the moment it gave up.

For state that lives outside a locator — a background job, a queue, another service — `expect.poll` and `expect(...).toPass()` retry an arbitrary callback with a real timeout and a readable failure. They are the honest version of a fixed sleep.

## The verdict

Every test in review resolves to one of three outcomes:

- **accept** — it asserts observable behaviour, its locators survive a refactor, and it would fail if the feature broke;
- **fix** — the intent is sound and the implementation is not: replace the locator, convert the one-shot read, remove the sleep;
- **delete** — it asserts nothing, duplicates another test, or verifies a mock rather than the app; a leaner suite beats a longer one.

A good review comment names the problem, the consequence and the requested change:

> `checkout.spec.ts:12` — the button is located by a positional CSS chain, so the next layout change breaks this test. Locate it by role and accessible name.

The right outcome is usually a leaner file: duplicated and vacuous tests dilute the failures that matter, and deleting them is a contribution, not a loss. Say your verdict in one word — accept, fix, delete — and the diff shrinks while its value grows.

## Practice

The module task hands you a seeded spec: four tests, all passing, written by "an agent", targeting a small page in your own repository. Run it, audit it against the checklist, fix or delete what fails the audit, prove one fixed test fails for the right reason, and write the review comments that would go back to the agent.