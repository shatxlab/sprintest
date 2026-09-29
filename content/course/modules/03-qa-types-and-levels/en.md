# QA Types and Levels

Testing is not one activity. QA chooses a testing type, method, and level based on the risk in front of the team. An AI tutor can help you compare options, but you need to explain the reason behind each choice.

## Types of testing

### Functional testing

Functional testing checks behavior against requirements and user expectations. It asks: does the feature do the job it was created for?

Examples:

- Required fields reject empty values.
- A search result matches the query.
- A saved setting is visible after reopening the page.

### Non-functional testing

Non-functional testing checks quality attributes around the behavior: performance, security, accessibility, compatibility, usability, reliability, and maintainability.

Examples:

- The page remains usable on a slow connection.
- Error messages are understandable.
- Private data is not exposed to another user.
- The same flow works on supported browsers and screen sizes.

### Exploratory testing

Exploratory testing is structured investigation. You learn the product, form a hypothesis, try a path, observe results, and adjust the next check.

Good exploratory notes include:

- what you were trying to learn;
- what data or path you used;
- what looked risky, confusing, or inconsistent;
- what evidence you collected.

### Smoke testing

Smoke testing is a short confidence check after a build or deployment. It covers the smallest set of critical flows that tells the team whether deeper testing is worth starting.

A smoke set is not full coverage. It is a gate for obvious breakage.

### Regression testing and re-testing

Re-testing confirms that a reported defect was fixed. It repeats the condition that exposed the defect and checks nearby behavior if the fix touched shared logic.

Regression testing checks that existing behavior still works after a change. A good regression selection is risk-based: prioritize changed areas, connected areas, critical business flows, and historically fragile behavior.

### End-to-end testing

End-to-end testing follows a meaningful user or business flow across several components. It is valuable for release confidence, but it can be slower and more fragile than lower-level checks. Use it for flows where the integration itself is the risk.

### Positive and negative scenarios

A positive scenario uses valid data and expected actions. A negative scenario uses invalid, incomplete, conflicting, or unauthorized actions. Strong QA work includes both because real users create both.

## Testing methods

### Black box

Black-box testing checks externally visible behavior without relying on internal implementation. It is useful for requirements, user journeys, API contracts, and acceptance checks.

### White box

White-box testing uses knowledge of code, branches, data structures, or algorithms. It is common in unit tests, code reviews, and coverage analysis.

### Grey box

Grey-box testing combines external behavior with partial technical knowledge. A tester might know the API shape, data model, logs, or component boundaries and use that knowledge to design sharper checks.

## Testing levels

### Unit testing

Unit testing checks a small piece of logic in isolation. It is fast and precise, but it does not prove that components work together.

### Integration testing

Integration testing checks interaction between components: service to database, frontend to API, producer to queue, or one service to another.

### System testing

System testing checks the product as a whole in a realistic environment. It combines functional and non-functional concerns and supports release decisions.

### Acceptance testing

Acceptance testing checks whether the product is acceptable for its intended users and business purpose. User Acceptance Testing (UAT) often combines verification against requirements with validation against real needs.

Verification asks whether the product matches the specification. Validation asks whether the specification and product solve the right problem.

## Shift-left thinking

Shift-left means bringing QA thinking earlier into discovery, design, and development. Examples:

- review requirements before implementation;
- ask about edge cases while a feature is still small;
- draft test ideas while developers plan the work;
- test an API contract before a full interface exists;
- use AI to generate risk prompts, then decide which ones matter.

The goal is not to test everything earlier. The goal is to catch expensive misunderstandings before they become expensive rework.

## Choosing the right testing approach

When you plan testing, ask:

1. What changed?
2. What can fail in a way users or the business would notice?
3. Which level finds that failure fastest?
4. Which checks need human judgment?
5. Which checks are worth automating later?

A strong QA answer names trade-offs. For example, a small validation change may need unit tests, focused functional checks, and a short regression pass around related fields. It probably does not need a full end-to-end suite.

## Working with an AI tutor

Ask the tutor to challenge your classification, not to label everything for you. Useful prompts:

- "Here is a change. Which risks suggest functional checks, and which suggest non-functional checks?"
- "Review my regression selection for gaps."
- "Ask me questions that help choose the right testing level."
- "What evidence would make this release decision stronger?"

Keep ownership of the decision. The tutor can suggest options; you choose and justify the plan.

## Check your understanding

- What is the difference between re-testing and regression testing?
- When is an end-to-end test useful, and when is it too heavy?
- How can the same feature need both functional and non-functional testing?
- What makes an acceptance test different from a system test?
