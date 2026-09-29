# Jira and Confluence

Before the tools: the report itself. Jira and Confluence only carry a bug report; the craft lives in the report's structure. A good report lets a developer who never saw the failure reproduce it, understand its impact, and decide what to do without follow-up questions.

## Bug report anatomy

A complete bug report has eight parts:

- **Title** — names the feature and the failure, not a verdict: "Checkout: order placement fails with 500 on POST /api/v1/orders", not "Checkout is broken".
- **Environment** — build, browser, OS, device, account type, data state. Enough to rebuild the session.
- **Preconditions** — what must be true before step 1: an account with a saved payment method, a cart with two items, a specific feature flag.
- **Reproduction steps** — numbered, concrete, executable by a stranger: exact input values, exact button or endpoint, and whether the failure is constant or intermittent.
- **Expected result** — what the requirement says should happen.
- **Actual result** — what happened instead, in observable terms. State what you saw, not what you assume caused it.
- **Evidence** — screenshots or a short recording, the console log, the failing network request with status code and request ID, exact error text. Reference each piece where it belongs in the story.
- **Severity and priority** — two separate labels, each with a one-line justification.

Keep facts and guesses separate. "The response body says INTERNAL" is a fact. "The payment service is down" is a guess — mark it as one, or leave it out.

## Severity vs priority

Severity describes impact on users and the product. Priority describes how urgently the fix must happen. They are different axes, and the interesting calls are exactly where they diverge.

A simple matrix:

| | High priority | Low priority |
|---|---|---|
| **High severity** | fix now, hotfix or stop the line | fix soon, batch with next release |
| **Low severity** | fix soon, cheap and visible | fix in normal backlog |

Fully worked examples:

- **Footer typo.** The copyright line still shows 2025; the 2026 release was expected here. Symptom: cosmetic, nothing misbehaves. Severity low: no one is blocked or misled. Priority low: fine to leave for a sprint. Low/low.
- **Payment double-charge during a sale.** For one hour, every order is charged twice. Symptom: direct financial harm to every buyer, refund costs, trust damage. Severity critical: money is wrong across all transactions in the window. Priority highest: money is being lost right now — stop the sale or hotfix today. Critical/highest.
- **Crash on 2% of devices.** The app crashes on launch, but only on 32-bit Android devices, roughly 2% of the installed base. Symptom: a total failure for anyone hit. Severity high: affected users get nothing at all. Priority lower: small blast radius, and the fix rides the next platform release. High/medium.
- **No confirmation email after payment.** Payment succeeds, the order exists, but the receipt never arrives. Symptom: no proof of purchase, support absorbs the confusion. Severity medium: no money or data lost, but real friction. Priority medium: schedule within the sprint, ahead of cosmetic work.

When you set these fields, write the reasoning. A label without reasoning forces the team to guess.

## Doing it in Jira

Jira tracks work: stories, tasks, bugs, ownership, status, and release flow. Common issue types: **Epic** (a large initiative), **Story** (user-facing behavior), **Task** (concrete work), **Bug** (an observed problem).

A bug issue maps one-to-one to the report anatomy: summary = title; environment and preconditions in the description header; steps, expected, and actual in the body; severity and priority as fields with reasoning; evidence attached as screenshots, logs, or HAR files.

Workflow fields matter to testers: transitions like *Open → In Progress → Ready for QA → Closed* tell you when a fix lands in front of you. **Linking** turns a ticket into context: link the bug to the requirement it violates ("relates to"), to the fix ("is caused by / causes"), and to the regression test that will cover it. JQL searches these structured fields — `project = "SHOP" AND type = Bug AND status = "Ready for QA" ORDER BY priority DESC` — how you slice regression and triage work.

## Confluence documentation

Confluence stores durable knowledge, not tickets. For QA: requirements and acceptance criteria, release test strategy, regression scope, known risks, environment setup, and investigation notes. A Confluence page can embed Jira issues, but it must add context a ticket cannot: why the information matters, who uses it, and what changed.

## Working with an AI tutor

Ask the tutor to review your report for completeness, reproducibility, evidence quality, and severity and priority reasoning. Keep ownership of the facts: the tutor can structure the artifact, but it cannot know what you observed unless you provide precise evidence.

## Check yourself

- Can another person reproduce the issue from your steps without follow-up questions?
- Did you separate observed facts from guesses about the cause?
- Did you justify severity and priority separately?
- Does every Jira or Confluence link explain why it matters?
- Would the report still make sense a week later during release review?
