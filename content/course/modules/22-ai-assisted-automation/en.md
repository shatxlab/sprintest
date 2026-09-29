# AI-Assisted Playwright Workflow

An AI agent can produce a hundred lines of Playwright code in seconds. It can also produce a suite that is green, confident and worthless. The difference is not the model — it is the workflow around it: what you hand over before the first prompt, how you read the diff, and whether you run the result yourself.

This module describes one repeatable loop: **brief, draft, review, run, iterate, record**. It is agent-agnostic — any coding agent that can read a repository, edit files and run a shell works the same way.

## Step 1: give context before you ask for code

A prompt like "write tests for the checkout page" gives the agent nothing to anchor to, and you get invented selectors, invented fixtures and invented endpoints. Open the session by handing over what a new teammate would need:

- the repository itself — the agent can read files, so let it;
- `playwright.config.ts`, so it knows the base URL, projects, retries and trace settings;
- two or three existing specs that are already good, as the house style;
- the sources of truth for behaviour: the API contract, the ticket, the acceptance criteria;
- the constraints, stated as rules rather than wishes.

A brief that works looks like this:

```
Repo: our Playwright project. Read playwright.config.ts and
tests/checkout/*.spec.ts before writing anything.

Goal: cover the "apply discount code" behaviour on the checkout page.

Sources of truth:
- ticket QA-412 (acceptance criteria in the description)
- API contract: POST /cart/discount { code } -> 200 { valid, percent }

Constraints:
- role-based locators (getByRole / getByLabel); testid only where no role exists
- no fixed sleeps; rely on web-first assertions
- do not assert on exact UI copy
- keep the suite green: every existing test must still pass
- do not touch files outside tests/checkout/

Deliverable: a diff I can review, plus the exact command you ran
and its raw output.
```

The last two lines matter as much as the goal: they define what "done" means, and they ask for evidence.

## Step 2: state a verifiable outcome

"Write tests for X" is a task description. A verifiable outcome names what must be true when the work is finished: which behaviours are covered, what must not break, and what counts as failure. If you cannot phrase the acceptance criteria for the tests, you do not yet know what you want tested — and neither does the agent.

## Step 3: treat the first pass as a draft

The first answer is a proposal, never a deliverable. It is written from patterns, not from your system, so expect plausible-looking code carrying one or two assumptions that are simply false: a selector that exists only in the agent's imagination, a fixture nobody ever created, an endpoint borrowed from a similar project.

## Step 4: review the diff like a reviewer

Read it the way you would read a colleague's pull request. The checklist from module 17 is the instrument; mutation thinking is the proof. These questions catch most problems:

- **Behaviour or implementation?** Does the test assert what a user can observe, or does it reach into internals that will change next sprint?
- **Does the locator survive a refactor?** If the DOM is restructured tomorrow, will this still find the element?
- **Is the coverage new?** Search the suite for the same behaviour before accepting a second test for it.
- **Did it add fixtures and helpers it never uses?** Unused scaffolding becomes future confusion.
- **Would the test fail if the feature broke?** Mutation thinking is the only proof a test has value. Break the thing on purpose, locally: change the discount calculation, or make the mock return `valid: false`, and confirm the test turns red. A test that stays green while the behaviour is broken is a comment with extra steps.

## Step 5: run it yourself

"The agent says the tests pass" is not evidence. Run the suite yourself and read the report:

```
$ npx playwright test tests/checkout/discount.spec.ts
Running 3 tests using 3 workers
  3 passed (4.2s)
```

Two things matter beyond green. First, that failures fail for the right reason: break the code temporarily and read the assertion message — it must name the behaviour, not a timeout. Second, that nothing else in the suite went red while you were not looking.

When something fails, read the trace before changing a line. `npx playwright show-trace test-results/.../trace.zip` shows the DOM at the moment of failure, the network calls and the console side by side.

## Step 6: iterate on real output

Do not describe the failure to the agent — paste it. The raw error, the trace excerpt, the received value. An agent working from your paraphrase guesses; an agent working from the real stack trace fixes.

An iteration message that gets results:

```
Failing: expect(received).toContainText
Expected substring: "10% off"
Received string: "Discount applied"
The element is a status message, so the percent is rendered elsewhere.
Trace snapshot pasted below. Do not loosen the assertion —
find the element that actually shows the percent.
```

Note the last line. "Make the test pass" is an instruction an agent will satisfy in the cheapest way available, including by deleting the assertion.

## Step 7: turn the lesson into a convention

The durable artifact of a session is not the chat history. It is the rule that survives it. When the same review comment comes back three times, write it into the repository:

- a line in `AGENTS.md` or the README: "Locators: role or label first, testid only when no role exists. No fixed sleeps."
- a lint rule, so tooling enforces the convention rather than memory;
- a short review checklist in the pull-request template.

Next session the agent reads the convention and starts one step ahead. That compounding effect is the real reason to work this way.

## Pitfalls to watch

- The agent reports green without having run anything.
- Invented fixtures and selectors that do not exist in the repository.
- Over-mocking: the test passes because the mock always says yes.
- Tests that assert nothing meaningful and pass on every version of the product.
- Hardcoded waits (`waitForTimeout`) that hide timing, and retries that hide genuine flakiness.
- Unrelated rewrites mixed into the diff — reject them; one change at a time.
- Accepting a large diff you have not read. If you cannot explain every line, it is not reviewed.

The practice tasks put this loop to work: one full session on your own repository, and one audit of a whole agent delivery — several files at once, the way real handovers arrive.
