# Test Architecture: Fixtures and Isolation

Locators and assertions make a single test trustworthy. Architecture decides whether the suite is trustworthy. A file of ten tests that only passes in one order, on one machine, one worker at a time, is not a test suite — it is a script with extra steps.

This module is about the layer above the test body: the config that shapes a run, the fixtures that supply setup, and the discipline that gives every test its own clean world.

## playwright.config.ts: the shape of a run

The config file is a design document. Read it and you know whether the suite can be trusted in CI before running anything.

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
```

Four settings do the heavy lifting. `fullyParallel: true` lets tests inside one file run concurrently, which is exactly what exposes hidden dependencies between them. `workers` caps the concurrency so the run stays deterministic in resource use. `retries` stays low — retries are a diagnostic, not a cure. `trace: "retain-on-failure"` means every failure arrives with evidence attached, so debugging does not depend on reproducing it locally.

An important habit: run the suite once with `--workers=1` and once with `--workers=4`. If the results differ, you have an isolation defect, and the second run is the honest one.

## Fixtures: named setup without hidden state

Playwright's `beforeEach` and helper functions push state into outer scope. Fixtures are better because each test declares exactly what it needs, and the framework handles ordering, parallel safety, and teardown.

```ts
import { test as base, expect } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

type Fixtures = {
  todoApi: APIRequestContext;
  seededList: { id: string; name: string };
};

export const test = base.extend<Fixtures>({
  todoApi: async ({ request }, use) => {
    const context = await request.newContext({ baseURL: "http://localhost:3100" });
    await use(context);
    await context.dispose();
  },
  seededList: async ({ todoApi }, use) => {
    const name = `QA list ${crypto.randomUUID()}`;
    const response = await todoApi.post("/api/lists", { data: { name } });
    expect(response.ok()).toBeTruthy();
    const { id } = await response.json();
    await use({ id, name });
    await todoApi.delete(`/api/lists/${id}`);
  },
});
```

A test then reads as intent, not plumbing:

```ts
test("renames a list", async ({ page, seededList }) => {
  await page.goto(`/lists/${seededList.id}`);
  await page.getByRole("button", { name: "Rename" }).click();
  await page.getByLabel("List name").fill(`${seededList.name} v2`);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${seededList.name} v2`);
});
```

The fixture creates the data the test needs and deletes it afterwards, so the test owns its world. Fixtures compose: `seededList` receives `todoApi`, and Playwright resolves the graph per test. Nothing leaks between tests, even when they run in parallel in the same worker.

## Isolation: authentication without a login dance

Logging in through the UI in every test is slow and turns the login page into a single point of failure for the whole suite. Save the authenticated browser state once and reuse it.

```ts
import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("qa@example.com");
  await page.getByLabel("Password").fill("qa-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
```

The `setup` project runs first and the browser project depends on it. The state file holds cookies and browser storage, so a test starts already authenticated. Keep at least one test that does the real login — the saved state hides auth regressions if nothing ever exercises the flow. Never commit the state file or the credentials behind it.

## Test data: build it, do not inherit it

Order dependence is the most common cause of suites that pass locally and fail in CI. The guilty pattern is easy to spot:

```ts
let createdListId: string; // module scope: shared between tests

test("creates a list", async ({ page }) => {
  // ... createdListId = extracted from the page
});

test("renames the list", async ({ page }) => {
  await page.goto(`/lists/${createdListId}`); // depends on run order
});
```

Each test assumes the previous one ran, finished, and succeeded. In parallel, that assumption dies immediately; with `--repeat-each`, retries, or a shuffled order it dies more quietly, which is worse. The fix is not to sort the tests — it is to give every test the data it needs, through a fixture, with values unique per test (a UUID in the name, not a fixed one).

A useful smell list for review:

- a variable declared outside `test()` and written inside it;
- a test that passes only after another test has run;
- a fixed name, id, or email reused across tests;
- cleanup written in a separate "last" test;
- `test.describe.serial` used to paper over a dependency;
- a retry that makes a failure disappear.

Each of these means one test is borrowing another test's state. The correct fix is the same every time: the test creates what it needs.

## Page objects and helpers

Page objects are optional in Playwright, and thin ones age best. Encapsulate navigation and repeated multi-step actions; leave assertions in the test so a reader sees the expectation without opening a second file. A page object that contains ten asserts and business logic becomes the place where failures go to hide. If a helper needs `expect` heavily, ask whether it should be a test.

## Rules to carry

- Setup lives in a fixture, not in `beforeEach` with shared variables.
- Each test creates its own data and cleans it up in the same test or fixture.
- Authentication state is created once, reused deliberately, and tested directly at least once.
- The config is read as evidence: parallelism, workers, and retries tell you how honest the suite is.
- A suite that only passes in one order is broken, regardless of the colour of the report.

The practice task hands you a working — and duplicated — suite. Your job is to turn it into architecture.
