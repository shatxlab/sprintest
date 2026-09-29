# SQL and Databases for QA

SQL is a practical QA skill because many product behaviors are stored as data. A button may show the wrong balance, a report may miss a record, or an API may return a value that looks suspicious. SQL helps you inspect the source data and explain what you found.

This module focuses on read-only reasoning: understanding tables, writing safe `SELECT` queries, and turning query results into QA observations.

## Databases in product work

A database is an organized place for storing and retrieving data. In many web and mobile products, the application code reads and writes data through a database.

A relational database stores data in tables:

- A table contains rows and columns.
- A row is one record, such as one user, account, order, or transaction.
- A column is one attribute, such as `email`, `status`, `amount`, or `created_at`.
- Tables are connected through identifiers, such as `account_id` or `user_id`.

Common relational database systems include PostgreSQL, MySQL, Microsoft SQL Server, MariaDB, and SQLite.

## Why QA needs SQL

SQL helps a tester:

- confirm that a user action changed the expected records;
- compare UI, API, and database data;
- find missing, duplicated, or inconsistent records;
- prepare focused test data;
- investigate whether a visible issue comes from data, business logic, or presentation.

Good SQL work is not only about getting rows back. It is about asking a precise question and explaining why the result matters.

## The basic `SELECT` shape

Most QA database checks start with a `SELECT` query:

```sql
SELECT column_name, another_column
FROM table_name
WHERE condition;
```

- `SELECT` names the columns you want to see.
- `FROM` names the table.
- `WHERE` filters rows.

Examples:

```sql
SELECT *
FROM users;
```

```sql
SELECT name, email
FROM users
WHERE status = 'active';
```

```sql
SELECT account_id, balance
FROM accounts
WHERE balance < 0;
```

For QA evidence, specific columns are usually clearer than `SELECT *` because the result is easier to read and share.

## Filtering and combining conditions

Common operators:

- `=` equals
- `!=` or `<>` not equal
- `>`, `<`, `>=`, `<=` numeric or date comparisons
- `LIKE` pattern search
- `IN` match any value from a list
- `IS NULL` missing value
- `IS NOT NULL` present value
- `AND` both conditions must be true
- `OR` at least one condition must be true

Examples:

```sql
SELECT order_id, status
FROM orders
WHERE status IN ('Pending', 'Processing');
```

```sql
SELECT user_id, email
FROM users
WHERE email LIKE '%@example.com';
```

```sql
SELECT card_id, account_id
FROM cards
WHERE expires_on < '2026-09-25'
  AND status = 'active';
```

## Sorting, limits, and grouped checks

`ORDER BY` makes result review predictable:

```sql
SELECT account_id, created_at, amount
FROM transactions
ORDER BY account_id ASC, created_at DESC;
```

`LIMIT` keeps exploratory output small:

```sql
SELECT *
FROM transactions
ORDER BY created_at DESC
LIMIT 10;
```

`GROUP BY` helps answer count and summary questions:

```sql
SELECT status, COUNT(*) AS transaction_count
FROM transactions
GROUP BY status;
```

Aggregate functions include `COUNT`, `SUM`, `AVG`, `MIN`, and `MAX`.

## Joining tables

QA questions often need data from more than one table. A `JOIN` connects rows using related columns.

```sql
SELECT accounts.account_id, accounts.owner_name, cards.card_id, cards.status
FROM accounts
JOIN cards
  ON cards.account_id = accounts.account_id;
```

Useful join patterns:

- `INNER JOIN` returns rows with a match in both tables.
- `LEFT JOIN` keeps every row from the left table and fills the right side with `NULL` when no match exists.
- `LEFT JOIN ... WHERE right_table.id IS NULL` is useful for finding missing related records.

Example: transactions whose account record is missing.

```sql
SELECT transactions.transaction_id, transactions.account_id
FROM transactions
LEFT JOIN accounts
  ON accounts.account_id = transactions.account_id
WHERE accounts.account_id IS NULL;
```

## Subqueries

A subquery is a query inside another query. It can make a condition depend on another result.

```sql
SELECT transaction_id, account_id, amount
FROM transactions
WHERE account_id IN (
  SELECT account_id
  FROM accounts
  WHERE status = 'closed'
);
```

This asks: which transactions belong to accounts that are closed?

## Safe SQL habits for QA

- Prefer read-only queries when investigating.
- Be careful with `UPDATE`, `DELETE`, and `INSERT`; use a controlled environment and team process.
- Filter before acting. A missing `WHERE` can affect every row.
- Save the question, query, and result together so another person can understand your evidence.
- If a result looks surprising, check whether the data model allows that case before calling it a defect.

## Working with an AI tutor on SQL

An AI tutor can help you learn SQL when you keep ownership of the question. Ask it to:

- explain what a query does line by line;
- critique whether a query answers the stated QA question;
- suggest a smaller example dataset;
- help compare two query approaches;
- turn query results into a clear QA observation.

Do not ask the tutor to do the investigation for you. Draft your query, explain your intent, then request review.