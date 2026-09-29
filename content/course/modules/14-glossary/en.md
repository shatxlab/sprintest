# Glossary

This module is a compact bilingual reference. Use it when you read tasks, write bug reports, ask an AI tutor for help, or translate between Russian team language and English QA/IT terms.

A glossary is not a script. The same word can change meaning by context, so ask clarifying questions when a term is vague.

## How to use the glossary with AI

- Ask the tutor to explain a term in the context of your current task.
- Ask for two short examples: one correct usage and one common misunderstanding.
- When writing a report, keep the product behavior clear before polishing terminology.
- If a Russian loanword is common in the team, keep it in parentheses on first mention.

## Core QA terms

| English term | Russian / team usage | Plain meaning |
| --- | --- | --- |
| Quality Assurance (QA) | обеспечение качества | Preventing quality problems through process, review, and testing activities. |
| Quality Control (QC) | контроль качества | Checking whether a product meets defined expectations. |
| Requirement | требование | A stated need, rule, or behavior the product is expected to satisfy. |
| Specification | спецификация, спека | A document or source that describes expected behavior. |
| Test case | тест-кейс | A concrete check with preconditions, steps, data, and expected result. |
| Checklist | чек-лист | A compact list of things to check. |
| Test design | тест-дизайн | Choosing what to test and how to structure checks. |
| Equivalence partitioning | классы эквивалентности | Grouping inputs that are expected to behave similarly. |
| Boundary value analysis | анализ граничных значений | Checking values around the edges of allowed ranges. |
| Regression testing | регрессионное тестирование | Checking that a change did not break existing behavior. |
| Retest | ретест | Checking a specific fixed bug again. |
| Bug report | баг-репорт, тикет | A structured report about a defect or suspicious behavior. |
| Preconditions | предусловия | State that must be true before a test starts: account, data, environment. |
| Reproduction steps | шаги воспроизведения | Numbered actions that reliably recreate the bug. |
| Severity | серьёзность | Impact of a defect on users or the system. |
| Priority | приоритет | Urgency or business order for fixing work. |

## Product and delivery terms

| English term | Russian / team usage | Plain meaning |
| --- | --- | --- |
| Backlog | бэклог | Work not yet selected for implementation. |
| Planning | планирование | Meeting where a team selects or discusses upcoming work. |
| Grooming / refinement | груминг, уточнение | Clarifying backlog items before development. |
| Agile | аджайл | Iterative delivery approach with frequent feedback. |
| Waterfall | водопадная модель | Sequential delivery approach with phases completed in order. |
| Approve | аппрув, согласовать | Confirm that something is accepted. |
| Assign | ассайнить, назначить | Make a person responsible for an item. |
| Estimate | эстимейт, оценка | Forecast of effort, time, or complexity. |
| Deploy | деплой, развернуть | Release software to an environment. |
| Rollback | роллбэк, откат | Return to a previous version after a failed change. |
| Hotfix | хотфикс | Urgent fix released quickly. |
| Workaround | костыль, обходной путь | Temporary way to bypass a problem. |

## Technical terms

| English term | Russian / team usage | Plain meaning |
| --- | --- | --- |
| Frontend | фронтенд | Client-side part the user interacts with. |
| Backend | бэкенд | Server-side part that handles data and logic. |
| API | API, программный интерфейс | Rules that let systems communicate. |
| Request | запрос | Message sent to a system to get data or perform an action. |
| Response | ответ | Message returned by the system. |
| Status code | статус код | Numeric result of an HTTP response, such as 200 or 404. |
| JSON | JSON | Text data format commonly used in APIs. |
| XML | XML | Markup format used to store or transfer structured data. |
| Database | база данных, БД | Organized storage for data. |
| Relational database | реляционная БД | Database organized around related tables. |
| JOIN | JOIN | SQL operation that combines related rows from tables. |
| Log | лог | Record of events, errors, or system activity. |
| Environment | окружение | Place where software runs, such as dev, test, or production. |
| Credentials | креды | Login, password, token, or other access data. |
| Attachment | аттачмент | File attached to a ticket or message. |
| DevTools | девтулзы | Built-in browser tools for inspecting a page; the Network tab shows requests, status codes, and timing. |
| HAR file | HAR-файл | Archive of browser-network interaction, often used as evidence. |

## Architecture and operations terms

| English term | Russian / team usage | Plain meaning |
| --- | --- | --- |
| Client-server architecture | клиент-серверная архитектура | Client requests services; server processes and stores data. |
| Monolithic architecture | монолит | One application deployed as a single unit. |
| Microservice architecture | микросервисы | System made of small independent services. |
| Message queue (MQ) | очередь сообщений | Component that stores messages until another service processes them. |
| Producer | producer, отправитель | Service that sends messages to a queue. |
| Consumer | consumer, обработчик | Service that reads messages from a queue. |
| At-least-once delivery | доставка at-least-once | Queue guarantee where a message may arrive more than once; consumers deduplicate by id. |
| Dead-letter queue | dead-letter очередь | Queue for messages that failed processing after allowed retries. |
| CI/CD | непрерывная интеграция и доставка | Automation for build, test, and release flow. |
| DevOps | DevOps | Practices joining development and operations work. |
| DevSecOps | DevSecOps | Security practices integrated through delivery work. |
| Refactoring | рефакторинг | Improving code structure while keeping external behavior the same. |
| Legacy | легаси | Old code or systems that are hard to change safely. |
| Overengineering | оверинжениринг | More complexity than the problem needs. |

## Check your understanding

For any term, ask three questions:

1. What does it mean in this task?
2. What evidence would show it is working or failing?
3. Would a developer, tester, product manager, and support person interpret it the same way?
