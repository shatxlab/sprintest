# Architecture for QA

Architecture is the shape of a system: where work happens, how components exchange data, and where failures can appear. A tester does not need to be an architect to use this knowledge. You need enough context to ask better questions, choose useful tests, and describe defects precisely.

## Client and server

A client is the part a person or another system interacts with. A server processes requests, applies business rules, stores or retrieves data, and returns responses.

Examples:

- A browser requests a catalog page from a web server.
- A mobile app sends a profile update to an API.
- A reporting script requests a CSV export from a backend service.

For QA, the main question is: where could this failure originate?

- A layout problem may be client-side.
- A wrong total may be server-side, client-side, or a disagreement between both.
- A missing record may involve the client request, API validation, database write, cache, or permissions.

## Synchronous and asynchronous communication

In synchronous communication, the caller waits for a response before moving on. Login, saving a form, and loading a detail page are common examples.

In asynchronous communication, the request starts work that completes later. Examples include export generation, email delivery, background image processing, and queue-based order fulfillment.

QA risks differ:

- synchronous flows need response time, timeout, retry, and error-message checks;
- asynchronous flows need eventual status, duplicate prevention, notification, cancellation, and recovery checks.

## Authentication and authorization

Authentication answers: who is this actor?

Authorization answers: what is this actor allowed to do?

A user may authenticate successfully and still lack permission for a resource. Strong QA coverage checks both ideas separately. Do not stop at "can log in" when the real risk is access to someone else's data or admin-only actions.

## Monoliths

A monolith packages many capabilities into one deployable application. It can be simple to start and easier to run locally, but changes can affect distant areas because components share code, configuration, and data access.

QA focus for a monolith:

- regression around shared logic;
- end-to-end checks for key flows;
- migration and configuration checks before release;
- clear notes when a defect may come from shared code.

## Microservices

A microservice architecture splits capabilities across smaller services. Each service owns a focused responsibility and communicates through APIs, events, or messages.

QA focus for microservices:

- integration and contract testing between services;
- failure handling when one service is slow or unavailable;
- data consistency across service boundaries;
- request IDs, logs, and traceability for debugging;
- risk selection because full end-to-end environments can be expensive.

Microservices do not remove testing complexity. They move much of the risk into communication, observability, and deployment coordination.

## Service-oriented architecture

Service-oriented architecture also splits work across services, often with larger services and shared infrastructure such as an enterprise service bus. For QA, the testing concerns are similar to microservices, with extra attention to routing, shared data formats, and central integration components.

## Integration contracts

An integration contract describes how systems communicate. It can be an OpenAPI file, message schema, event description, table of endpoints, or a short written agreement.

A useful contract names:

- endpoint, event, or operation;
- required and optional fields;
- data types and validation rules;
- success and error responses;
- authentication and authorization expectations;
- versioning and backward compatibility rules.

Example contract excerpt:

```yaml
operation: Create support ticket
request:
  customerId: string
  subject: string
  priority: low | normal | urgent
responses:
  201: ticket created with id and status
  400: validation error with field messages
  403: customer is not allowed to create a ticket for this account
```

QA uses contracts to design API checks, identify missing examples, and catch breaking changes before they reach users.

## Network basics for testers

Most manual QA work happens at the application layer: HTTP methods, response codes, headers, bodies, and browser or API-tool observations.

Know the basics:

- `GET` retrieves data.
- `POST` usually creates or starts work.
- `PUT` or `PATCH` updates data.
- `DELETE` removes or deactivates data.
- `2xx` means success, `4xx` means client-side request problem or permission problem, `5xx` means server-side failure.

You do not need deep network engineering for entry-level QA, but you need to notice timeouts, redirects, caching, offline behavior, and inconsistent responses.

## Static architecture scenario

Use this simple system map for practice discussions:

```text
Browser
  -> Web frontend
  -> Profile API
  -> Profile database
  -> Email notification worker
```

Possible questions:

- What happens if the profile is saved but the email notification fails?
- Which component validates timezone values?
- Can the frontend show stale data from cache?
- How does support find a failed request in logs?
- What permissions apply when one user edits another user's profile?

The point is not to memorize the diagram. The point is to turn the diagram into test ideas and defect-location hypotheses.

## Working with an AI tutor

Ask the tutor to help you read architecture as a risk map:

- "Here is a component diagram. Ask me what can fail at each boundary."
- "Review whether my tests cover client, API, database, and background worker risks."
- "Help me turn this contract excerpt into API checks without giving me a finished checklist first."
- "Challenge my defect-location hypothesis."

Use the AI response as a reviewer. Keep your own reasoning visible: name the component, the risk, the evidence, and the next test.

## Check your understanding

- How are authentication and authorization different?
- Why can asynchronous flows pass an immediate check and still fail later?
- What makes microservice testing different from monolith testing?
- How can an integration contract become a source for tests?
