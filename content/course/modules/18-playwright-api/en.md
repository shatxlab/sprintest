# API Testing with Playwright

Playwright is known as a browser tool, but the `request` fixture turns the same runner into an API client. One repository, one config, one HTML report for UI and API tests — and, more importantly, one place where the API contract and the interface that consumes it are checked together.

## The request fixture

Every test gets a `request` fixture: an isolated `APIRequestContext` that inherits the `baseURL` from `playwright.config.ts` and the cookies of that test's browser context.

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: process.env.API_URL ?? "http://127.0.0.1:4010",
    extraHTTPHeaders: { Accept: "application/json" },
  },
});
```

```ts
// accounts.spec.ts
import { test, expect } from "@playwright/test";

test("returns the requested account", async ({ request }) => {
  const response = await request.get("/accounts/acc-1001");

  expect(response.status()).toBe(200);
  const account = await response.json();
  expect(account).toMatchObject({ id: "acc-1001", currency: "EUR" });
  expect(typeof account.balance).toBe("number");
});
```

`response.status()`, `response.headers()`, `response.json()` and `response.text()` are your raw material. `response.ok()` is a shortcut for "status is in the 2xx range" — convenient, and dangerous when it is the only thing you assert.

Because the fixture shares cookies with the browser context, an API call can prepare a session that the page then uses:

```ts
test("a session created over the API is visible in the UI", async ({ request, page }) => {
  const login = await request.post("/login", {
    data: { email: "qa@example.com", password: "secret" },
  });
  expect(login.status()).toBe(204);

  await page.goto("/dashboard");
  await expect(page.getByTestId("user-email")).toHaveText("qa@example.com");
});
```

For setup and teardown outside a test — seeding data in global setup, cleaning it up afterwards — create a standalone context:

```ts
import { request } from "@playwright/test";

const api = await request.newContext({
  baseURL: process.env.API_URL ?? "http://127.0.0.1:4010",
  extraHTTPHeaders: { "X-Run-Id": process.env.RUN_ID ?? "local" },
});
await api.dispose();
```

## What a good API test asserts

A status code is the weakest possible assertion. A proper API test checks three things:

1. the status code, and the error contract when the request is supposed to fail;
2. the shape of the body: the fields the client depends on, with the right types;
3. the behaviour: what changed in the system because of this request.

```ts
test("creates an order and returns it on the next read", async ({ request }) => {
  const created = await request.post("/orders", {
    data: { accountId: "acc-1001", amount: 25, currency: "EUR" },
  });
  expect(created.status()).toBe(201);
  const order = await created.json();
  expect(order.id).toBeTruthy();

  const fetched = await request.get(`/orders/${order.id}`);
  expect(fetched.status()).toBe(200);
  expect(await fetched.json()).toMatchObject({ id: order.id, amount: 25 });

  await request.delete(`/orders/${order.id}`);
});
```

Chaining is where API tests earn their keep: the second call verifies the first one, and the cleanup keeps the run repeatable.

## Traps that hide real bugs

**A 200 that carries an error.** Some services answer 200 with `{ "error": "..." }` in the body. `expect(response.ok()).toBe(true)` passes, the report is green, and the bug ships. Read the body before you trust the status.

**Aggregates that do not add up.** A summary endpoint is a second, independent implementation of the same arithmetic as the list endpoint. `GET /accounts/summary` can disagree with the sum of `GET /accounts` while both return 200. Compare them; nobody else will.

**Validation holes.** Send what the UI never sends: a negative amount, an empty string, a missing field, an id belonging to another account. An accepted invalid payload is a finding, not a test failure to silence.

**Tests that pass for the wrong reason.** If a test is green because you asserted nothing, or because the assertion was `expect(body).toBeDefined()`, the test costs time and buys nothing. When a test fails, read the message: does it describe the bug, or your test?

**Data that outlives the run.** Created records without cleanup make the second run fail, and telling "broken" apart from "dirty" eats an afternoon. Generate unique values per run (a timestamp or a run id in the name) and delete what you create.

## Flows in one test, readable in the report

A chain of five calls in a single function is unreadable when it fails at call four. `test.step` names each business action, so the report points at the step that broke:

```ts
test("order lifecycle", async ({ request }) => {
  const order = await test.step("create order", async () => {
    const response = await request.post("/orders", {
      data: { accountId: "acc-1001", amount: 25 },
    });
    expect(response.status()).toBe(201);
    return response.json();
  });

  await test.step("order appears in the list", async () => {
    const response = await request.get("/orders?accountId=acc-1001");
    expect(response.status()).toBe(200);
    const ids = (await response.json()).map((item: { id: string }) => item.id);
    expect(ids).toContain(order.id);
  });

  await test.step("delete removes it", async () => {
    const removed = await request.delete(`/orders/${order.id}`);
    expect(removed.status()).toBe(204);

    const after = await request.get("/orders?accountId=acc-1001");
    const ids = (await after.json()).map((item: { id: string }) => item.id);
    expect(ids).not.toContain(order.id);
  });
});
```

Which requests deserve a test? The ones a client depends on and the ones where two code paths compute the same thing. A formatter endpoint or a static health check adds runtime and no information.

## Check by hand before you automate

Before writing the test, state the check in words and run it once manually — with `curl`, `httpie`, or the browser's network panel. The order matters: a test that encodes a wrong expectation is worse than no test, because it looks like coverage.

Put two things into every API failure report: the exact request (method, path, payload) and the exact response (status, body). That pair is what a developer needs, and it is also what makes your test reproducible.

## Where the target comes from

For the exercises in this module you do not need a public service. The default is a tiny Node mock API that your AI agent scaffolds inside your own repository — an accounts and orders REST service you fully control, so the tests run offline and deterministically. A well-known public practice API (jsonplaceholder.typicode.com, httpbin.org, petstore.swagger.io) is a fine fallback when you want to see the same patterns against somebody else's contract; both routes teach the same skills.

Move on to the practice tasks for this module: first request-level tests with status and error-contract checks, then a chained flow that verifies state after every step.
