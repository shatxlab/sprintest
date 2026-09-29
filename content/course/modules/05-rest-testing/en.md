# REST API Testing

REST APIs let a client and a server exchange resources over HTTP. A QA engineer tests that exchange at the contract level: request method, endpoint, headers, body, status code, response schema, data rules, error handling, and useful diagnostics.

## The REST mental model

Think of a resource as a noun and an HTTP method as the action around that noun.

| Method | Common intent | Example endpoint | QA focus |
|---|---|---|---|
| GET | Read data | `/orders/123` | Status, filtering, permissions, shape of returned data |
| POST | Create data or trigger an action | `/orders` | Required fields, validation, duplicate handling, created resource reference |
| PUT | Replace a resource | `/orders/123` | Full update semantics, missing fields, idempotency |
| PATCH | Change part of a resource | `/orders/123` | Partial update rules, unchanged fields, conflict handling |
| DELETE | Remove a resource | `/orders/123` | Authorization, repeat calls, related data |

REST is not only CRUD. Many APIs also expose action endpoints such as `/orders/123/cancel`. Treat them as contract behavior: what inputs are allowed, what state transition happens, and what response proves the outcome.

## Anatomy of a request

A request usually contains:

- **Base URL and endpoint**: the service address and resource path.
- **Method**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, or another HTTP verb.
- **Headers**: authentication, content type, correlation ids, locale, cache controls.
- **Query parameters**: filtering, sorting, pagination, feature flags.
- **Body**: JSON or another payload format for methods that send data.

Example:

```http
POST /v1/orders HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
Idempotency-Key: 8f4b3f

{
  "customerId": "cus-104",
  "items": [
    { "sku": "BOOK-1", "quantity": 2 }
  ]
}
```

QA questions:

- Which fields are required?
- Which values are invalid, empty, too long, duplicated, or out of range?
- What authorization is required?
- What happens when the same request is retried?
- Which response fields are stable contract fields and which are informational?

## Anatomy of a response

A response usually contains:

- **Status code**: the broad outcome of the request.
- **Headers**: content type, cache rules, request id, pagination links, rate-limit information.
- **Body**: JSON data or an error object.

Status code families:

- **2xx success**: `200 OK`, `201 Created`, `204 No Content`.
- **3xx redirect**: useful for clients but less common in JSON APIs.
- **4xx client or request problem**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests`.
- **5xx server problem**: `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`.

A strong REST test checks the combination, not a single field. For example: a missing required field may return `400` or `422`, but the API documentation needs to define which one, and the error body needs to help the caller fix the request.

## Positive, negative, and contract checks

Useful API coverage includes:

1. **Happy path**: valid request, expected status, expected response body.
2. **Validation**: missing field, wrong type, boundary values, malformed JSON.
3. **Authorization**: no token, wrong role, expired token, access to someone else's resource.
4. **State rules**: cancel an already shipped order, update a closed ticket, repeat a transfer request.
5. **Pagination and filtering**: first page, empty result, large page size, invalid sort key.
6. **Idempotency and retries**: repeat a safe request and compare the outcome.
7. **Observability**: request id, consistent error format, meaningful but safe messages.

## Postman and curl

Postman is useful for organizing exploratory requests, examples, environments, and lightweight assertions. `curl` is useful for sharing an exact request in text form, reproducing a case quickly, and documenting evidence.

Example curl request:

```bash
curl -i -X POST 'https://api.example.test/v1/orders' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  --data '{"customerId":"cus-104","items":[{"sku":"BOOK-1","quantity":2}]}'
```

When you record evidence, include the method, endpoint, relevant headers without secrets, request body, status, and the important part of the response.

## API test design heuristics

For each endpoint, build a small test matrix:

- Resource exists / does not exist.
- Caller is allowed / not allowed.
- Payload is complete / incomplete / malformed.
- Data is normal / boundary / extreme.
- Request is first attempt / repeated attempt.
- Service returns data / no matching data.

The goal is not to test every combination. The goal is to choose combinations that expose risk and explain why they matter.

## Working with an AI tutor

Ask the tutor to review your API test thinking, not to invent a perfect checklist. Share the documentation excerpt, your assumptions, your selected requests, and your evidence. Ask for gaps in coverage, unclear expected results, and better ways to group the checks.

Keep ownership of the conclusion. If the API contract is ambiguous, write the ambiguity as a question for the team rather than pretending the expected behavior is known.