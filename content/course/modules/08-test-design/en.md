# Test Design

Test design is the skill of turning requirements, risks, and product behavior into useful checks. A tester does not try every possible input. A tester chooses representative checks that reveal important information quickly.

Good test design answers four questions:

1. What behavior matters most?
2. Which inputs or states are meaningfully different?
3. Where are mistakes likely?
4. What evidence would convince the team?

## Start from requirements and risk

Before writing test cases, clarify the feature:

- purpose and user value;
- functional rules;
- non-functional expectations such as performance, security, accessibility, and localization;
- dependencies on APIs, data, other teams, or external services;
- business impact if the feature fails.

If the requirement is vague, turn uncertainty into questions. Test design begins before the first test case.

## Equivalence class partitioning

Equivalence partitioning divides inputs into groups that the system is expected to handle the same way. One representative from each class can give useful coverage.

Example: a service accepts a quantity from 1 to 99.

| Class | Meaning | Example value |
| --- | --- | --- |
| Invalid low | Less than 1 | 0 |
| Valid | 1 through 99 | 20 |
| Invalid high | More than 99 | 100 |
| Invalid format | Not a number | `abc` |

This technique reduces noise and helps explain why a test exists.

## Boundary value analysis

Many bugs happen at edges. Boundary value analysis checks values on and around limits.

For the same quantity rule, useful values include:

- 0 and 1 around the minimum;
- 98, 99, and 100 around the maximum;
- empty input if the field can be blank;
- decimal or negative values if the UI allows typing them.

Boundary checks are strongest when the expected result is precise: accepted, rejected, rounded, normalized, or blocked.

## Decision tables

Decision tables help when the outcome depends on several conditions.

Example: delivery fee rules.

| Condition | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
| --- | --- | --- | --- | --- |
| Order total >= 100 | Yes | Yes | No | No |
| Customer has premium plan | Yes | No | Yes | No |
| **Free delivery** | Yes | Yes | Yes | No |
| **Paid delivery** | No | No | No | Yes |

The table shows which combinations need checks and exposes missing rules.

## State transition testing

Use state transitions when behavior depends on current state and events.

Example order states:

- Draft;
- Submitted;
- Paid;
- Packed;
- Shipped;
- Cancelled.

Useful tests cover allowed transitions, forbidden transitions, repeated events, and recovery after partial failure. For example, a paid order may move to packed, but a shipped order usually cannot return to draft.

## Pairwise testing

Pairwise testing is useful when many parameters interact. The goal is to cover every pair of parameter values with fewer cases than exhaustive testing.

Example configuration:

- format: PDF, CSV, XLSX;
- period: day, week, month;
- detail level: summary, detailed.

Full coverage is 18 combinations. A smaller pairwise set can still cover every pair of format, period, and detail level. Pairwise does not replace risk thinking: high-risk combinations may still deserve extra tests.

## Exploratory testing

Exploratory testing combines learning, designing, and executing tests in one session. It works best with a charter:

- goal of the session;
- timebox;
- areas to explore;
- notes about actions, observations, questions, and possible defects.

Exploratory testing complements formal techniques. It is especially useful when requirements are incomplete or the product behavior is unfamiliar.

## Writing useful test cases

A good test case is clear enough for another tester to run and specific enough to reveal a real result.

Include:

- title;
- preconditions;
- test data;
- steps;
- expected result for each meaningful step;
- postconditions when cleanup matters.

Avoid vague wording such as “enter some data” or “everything works.” Use observable facts: exact values, visible messages, state changes, API response fields, saved records, or logs.

## Regression suite thinking

Regression testing checks that a change did not break existing behavior. A regression suite is stronger when it is prioritized:

- smoke checks for the most critical paths;
- high-risk business rules;
- areas recently changed;
- previously fixed defects;
- integration points;
- edge cases that are expensive to miss.

A huge unprioritized suite can be slow and still miss the real risk. A smaller suite with clear intent is often more useful.

## Peeking under the hood with devtools

Every web UI is a thin layer over requests. Browser devtools let you see that layer, and it takes one key press: open the page, press F12, switch to the Network tab, and refresh.

The Network tab shows one row per request:

- method (GET, POST, PUT, DELETE) and URL;
- status code (200, 301, 404, 500) and its meaning;
- size, type, and timing.

Most of what matters hides in XHR/Fetch requests — the background calls a single click triggers. Apply the XHR/Fetch filter, clear the log, click a button or submit a sign-in form, and read what fires: which endpoints were called, what came back, what the page did silently on your behalf.

Status codes and requests are a tester's evidence. “The page didn't load” is an opinion; “POST /api/login returned 500, then GET /api/orders returned 403” is a fact a developer can act on. Before claiming a defect, open the Network tab and record what actually happened.

## Working with an AI tutor

Ask the tutor to review your reasoning: equivalence classes, missing boundaries, incomplete decision table rules, state transitions, and unclear expected results. Do the first draft yourself. The tutor can challenge gaps and help improve wording, but the design choices remain yours.
