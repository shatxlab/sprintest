# Playwright: Read and Run

Manual testing finds a bug once. An automated test finds the same bug every time the code changes, on every machine, without being asked. That difference is why automation QA roles ask for a test framework — and the framework the industry settled on is Playwright.

This module is the first of seven on browser automation, and it starts from a fact of the AI era: your agent will happily write the first draft of any test you describe. But whether that draft is worth keeping is decided by someone who can read it — who runs it, understands every line, and can tell a test that checks the product from one that merely passes. That someone is you, and reading is the skill this whole track stands on. Here you set up a Playwright project and learn to read a test — its anatomy, its locators, its web-first assertions — to run it, and to read what the run really says when it goes red.

## Why Playwright

- **One API, three engines.** The same test runs in Chromium, Firefox, and WebKit. Cross-browser coverage stops being a separate project.
- **Auto-waiting.** Every action waits for its element to exist, be visible, be stable, and be enabled before it acts. The manual "wait for the spinner" logic that made older tools brittle is built in.
- **A test runner included.** `@playwright/test` ships with the runner, assertions, fixtures, parallel execution, reporters, and the trace viewer. No second framework to bolt on.
- **Node and TypeScript first.** Types come from the library, so your editor tells you when you call an action that does not exist.

Plan to spend an hour on setup once. After that, a new test file is three lines away from running.

## The project skeleton

```bash
npm init playwright@latest
npx playwright install
```

The initializer creates the config, a `tests` folder, an example spec, and installs the browsers. Everything below lives in `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

Two settings earn their place immediately. `baseURL` lets tests call `page.goto('/')`. `trace: 'retain-on-failure'` records a trace for every failing test and throws it away for passing ones — the cheapest debugging insurance you can buy.

## Reading a test

When an agent hands you a spec file, your first job is to read it like code you are responsible for. Take this one:

```ts
import { test, expect } from '@playwright/test';

test('counter starts at zero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('counter-value')).toHaveText('0');
});

test.describe('sign-up form', () => {
  test('rejects an empty email', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toContainText('Email is required');
  });
});
```

Read it in four parts. `test(...)` registers one behaviour. The `{ page }` argument is a fixture — Playwright hands you a fresh page for every test, inside a fresh browser context, so no test inherits another test's state. `async` and `await` are not decoration: every browser action is asynchronous and must be awaited, otherwise the test moves on before the click happens. `expect` is the assertion.

Read every file the agent gives you against two habits:

- **One behaviour per test.** A test that signs up, checks the counter, and filters a list reports three unrelated failures as one red line. If the agent wrote that, it is a finding to raise, not a preference to shrug off.
- **Name the behaviour, not the mechanics.** `test('counter starts at zero')` beats `test('counter test 1')` — the report becomes a readable checklist of what the product does. A mechanical name also hides what the test would catch and what it would miss.

## Finding elements the way a user does

Locators are how a test reaches an element. When you read an agent-written test, the locator is the first thing to judge, because it decides whether the test survives a refactor. Reach for, in order:

```ts
await page.getByLabel('Email').fill('qa@example.com');
await page.getByRole('button', { name: 'Create account' }).click();
await expect(page.getByRole('alert')).toContainText('Email is required');
```

`getByRole` matches the accessibility role and name — the same thing a screen reader announces and the same thing a user clicks. `getByLabel` binds an input to its visible label. `getByTestId` is the escape hatch for elements a user cannot describe, and it survives CSS refactors because it is not tied to styling or structure. The next module turns this vocabulary into a review checklist for tests an agent wrote; for now, read a raw CSS chain that encodes layout as a finding to raise, not a style to accept.

## Web-first assertions and waiting

Playwright assertions retry until the condition holds or the timeout expires:

```ts
await expect(page.getByRole('listitem')).toHaveCount(3);
await expect(page.getByTestId('status')).toBeVisible();
await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
```

This is why a Playwright test needs no waiting code: `toHaveCount(3)` keeps checking until the list has three items or five seconds pass. When you read an agent-written test, this is the first thing to demand: assertions that retry, and no `page.waitForTimeout(2000)` — a fixed pause that is either too short (flaky) or too long (slow), and it hides the real reason a test was unstable. Treat it as a smell, not a tool.

## Running tests and reading the result

```bash
npx playwright test                       # everything, headless
npx playwright test signup                # only files matching 'signup'
npx playwright test --headed              # watch the browser
npx playwright test --ui                  # time-travel debugger
npx playwright test --repeat-each=3       # catch order and timing flakiness
npx playwright show-report                # HTML report from the last run
npx playwright show-trace trace.zip       # step through a recorded failure
```

An agent may report its suite green. Believe the run, not the report: run it yourself and read the raw output — every command above gets used in task one.

When a test goes red, ask three questions in this order: **did the product break, did the test break, or did the environment break?** A wrong assertion that caught correct behaviour is a test bug — fix the test, do not file a ticket. A correct assertion failing against a wrong product is a real bug — file it with the trace attached. Genuine flakiness usually means shared state, a missing `await`, or a fixed wait.

## What to automate first

Automation is an investment, and the return is frequency × risk. Flows that run on every build and would cost money to break come first. One-time migrations, screens that are being redesigned next sprint, third-party payment frames you cannot control, and checks that only a human eye can judge cost more to maintain than they save — for now. Task two of this module asks you to make exactly those calls on paper.

## Practice

Task one hands you an agent-written page and suite: run the suite, read every test line by line, explain what each really checks, and modify it in three small ways. Task two is a prioritisation exercise where you defend what you automate and what you deliberately leave to a human.
