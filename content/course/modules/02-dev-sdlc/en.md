# SDLC and Development Methodologies

SDLC is the software development life cycle: the path from an idea to a working product and later support. QA participates across this path, not only at the final testing stage.

## SDLC phases

A simple SDLC model includes:

1. **Initiation** — the team understands the goal, business need, users, and constraints.
2. **Planning** — the team defines scope, timeline, risks, responsibilities, and priorities.
3. **Design** — analysts, designers, and architects shape how the feature or system will work.
4. **Development** — developers implement the change and integrate it with the product.
5. **Testing** — testers and the team gather evidence about quality, defects, and remaining risk.
6. **Deployment** — the change is released to users or prepared for release.
7. **Support and maintenance** — the team monitors, fixes, learns, and improves the product.

QA can contribute at every phase: ask questions during initiation, identify risk during planning, review behavior during design, test early builds during development, gather release evidence during testing, smoke test after deployment, and analyze incidents during support.

## Agile, Scrum, Kanban, and Waterfall

**Agile** is a set of principles for iterative delivery, fast feedback, and adaptation. QA in Agile works continuously with the team, not as a separate final gate.

**Scrum** organizes work into sprints with planning, daily coordination, review, and retrospective. QA helps refine stories, plan testing work, test during the sprint, and discuss quality during review.

**Kanban** visualizes the flow of work and limits work in progress. QA watches bottlenecks, blocked testing, aging tasks, and handoff problems.

**Waterfall** is a sequential model where phases are completed in order. QA often receives more complete documentation, but late feedback can be expensive.

No methodology is automatically best. The useful QA question is: how does this process affect feedback speed, risk visibility, and release confidence?

## DevOps, DevSecOps, and CI/CD

**DevOps** brings development and operations closer together so software can be delivered reliably. **DevSecOps** adds security practices throughout the same flow.

**CI/CD** means continuous integration and continuous delivery or deployment. For QA, CI/CD creates faster feedback through automated builds, checks, and deployable versions. Manual QA still matters: automation gives signals, while testers investigate risk, user value, unclear behavior, and gaps in coverage.

## Environments

Teams often use several environments:

- **DEV** for early development and unstable builds;
- **TEST or STAGE** for broader functional, integration, and regression testing;
- **PRE-PROD** for final release rehearsal and configuration checks;
- **PROD** for real users, monitoring, and limited smoke checks after release.

Always ask what changed between environments. A feature can behave differently because of data, configuration, integrations, permissions, or release timing.

## SDLC thinking for QA

When you study a feature, place your QA work on the timeline:

- What can be clarified before implementation?
- Which risks need evidence before release?
- Which checks belong early, and which belong near deployment?
- What could production monitoring reveal after release?

This timeline view helps you avoid treating testing as a single late activity.
