# Running Tests in CI

A Playwright suite that only runs on your machine is a private habit. A suite that runs on every push is shared infrastructure: anyone who breaks something finds out within minutes, without asking you. This module is about moving a working local suite into continuous integration without losing what made it useful.

## What CI changes about your run

Locally you have accumulated state: installed browsers, a warm package cache, test data you seeded days ago, a dev server you forgot about. CI starts from a clean checkout on a machine that has never seen your project, so everything your suite quietly depended on has to be installed on purpose.

Three consequences matter:

- **Headless is the default.** There is no visible window on a runner, and a test that only passed because you clicked at the right moment is not a test.
- **The report is the only witness.** Nobody is sitting in front of the machine, so the HTML report, the JUnit XML, and the traces are the entire story of the run.
- **Time and resources are shared.** A runner has fewer cores and a colder cache than your laptop, so generous local timeouts and heavy parallelism behave differently.

## Make a clean checkout work

Two commands close the gap between a fresh machine and a runnable suite:

```bash
npm ci
npx playwright install --with-deps chromium
```

`npm ci` installs exactly what the lockfile pins — the version combination the team actually tested. `npx playwright install --with-deps chromium` downloads the browser **and** the operating-system libraries it needs — the ones your laptop already had. Skipping `--with-deps` on a runner is a classic first failure: the browser downloads fine and then dies at launch with a missing shared library.

## The workflow file

Here is a GitHub Actions workflow that runs the suite on every push and pull request and keeps the report as an artifact.

```yaml
name: playwright

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: |
            playwright-report/
            test-results/
          retention-days: 14
```

Read it as a sequence of promises: check out the code, install a known Node version, install dependencies from the lockfile, install the browser, run the tests, upload the evidence. The `if: ${{ !cancelled() }}` line is the one people forget — without it a failing run uploads nothing, and a failing run is exactly when you need the report.

`timeout-minutes` is a guard rail, not a target. A hung browser can hold a job for six hours and turn your pipeline into a queue everyone waits in.

## Reporters: two audiences

A CI run has two consumers: a human debugging a failure and the platform showing a status. Configure both.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

The choices worth defending:

- `html` with `open: 'never'` writes a self-contained report directory without trying to serve it. On a runner an auto-opened report can hold the job open until the timeout.
- `junit` produces XML the CI interface parses into a per-test list, so a reviewer sees which test failed without downloading anything.
- `forbidOnly` fails the run when a `test.only` slipped into a commit. A focused test that shrinks the suite to one case is the quietest way to lose coverage.
- `trace: 'on-first-retry'` captures a trace only when something went wrong: cheap in the happy path, complete in the sad one.
- `retries: 1` in CI only. Locally you want the honest first result.
- `baseURL` read from the environment, so the same suite can point at a local target or a deployed one.

## Traces: the CI debugger

You cannot attach a debugger to a runner, but you can download the trace. The artifact holds one zip per failed test; `npx playwright show-trace path/to/trace.zip` opens the timeline with DOM snapshots, network activity, and console output. When you need a trace from a local run, `npx playwright test --trace on` records everything, and `npx playwright test --ui` is the fastest way to reproduce a failure in a watchable window.

## Keeping the run honest

**Retries hide flakiness; they do not remove it.** One retry keeps a red pipeline from blocking the team on a known-unstable test, but it has to come with a plan: reproduce with `npx playwright test --repeat-each=5`, fix the cause, or quarantine and delete the test. A test that passes on the second attempt is a defect in the suite.

**Sharding buys wall-clock time.** `npx playwright test --shard=1/3` runs a third of the suite, so a matrix of three jobs finishes in roughly a third of the time. Each shard still installs its own browser — caching `~/.cache/ms-playwright` with `actions/cache@v4` keyed on the lockfile skips the download — and sharding exposes tests that quietly depended on execution order.

**Failures that exist only in CI** usually come from one of four places: an absolute URL or hardcoded port where `baseURL` should come from the environment, a timeout that was generous on your laptop, test data or an auth file that existed locally but is never created in a clean checkout, and a fixed sleep that happened to be long enough on your machine. Classify the failure before fixing it: product bug, test bug, or environment. Only the first one goes to a developer as a defect.

## What a green run does not mean

Green means the tests ran and passed — not that they are any good. A test with no assertion passes forever. A pipeline nobody reads is worse than no pipeline, because it produces noise with authority. The value of CI is not the badge; it is the habit that a red run gets read, classified, and either fixed or deleted within a day.

Set up your own pipeline in the practice task for this module: you write the workflow, configure the reporters, and prove the CI path by running the suite headless the way a runner would.
