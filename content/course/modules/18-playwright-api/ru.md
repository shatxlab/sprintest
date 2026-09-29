# Тестирование API с Playwright

Playwright известен как инструмент для браузера, но фикстура `request` превращает тот же раннер в API-клиент. Один репозиторий, один конфиг, один HTML-отчёт для UI- и API-тестов — и, что важнее, одно место, где контракт API и интерфейс, который им пользуется, проверяются вместе.

## Фикстура request

Каждому тесту доступна фикстура `request` — изолированный `APIRequestContext`, который наследует `baseURL` из `playwright.config.ts` и cookies браузерного контекста этого теста.

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

`response.status()`, `response.headers()`, `response.json()` и `response.text()` — ваше сырьё. `response.ok()` — сокращение для «статус в диапазоне 2xx»: удобно и опасно, когда это единственная проверка в тесте.

Фикстура делит cookies с браузерным контекстом, поэтому вызов API может подготовить сессию, которой затем воспользуется страница:

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

Для подготовки и уборки вне теста — засеять данные в global setup, удалить их после прогона — создайте отдельный контекст:

```ts
import { request } from "@playwright/test";

const api = await request.newContext({
  baseURL: process.env.API_URL ?? "http://127.0.0.1:4010",
  extraHTTPHeaders: { "X-Run-Id": process.env.RUN_ID ?? "local" },
});
await api.dispose();
```

## Что проверяет хороший API-тест

Статус-код — самая слабая из возможных проверок. Хороший API-тест проверяет три вещи:

1. статус-код и контракт ошибки, когда запрос должен упасть;
2. форму тела: поля, от которых зависит клиент, и их типы;
3. поведение: что изменилось в системе из-за этого запроса.

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

Цепочка вызовов — то, ради чего API-тесты и нужны: второй вызов подтверждает первый, а уборка делает прогон повторяемым.

## Ловушки, за которыми прячутся настоящие баги

**200 с ошибкой внутри.** Часть сервисов отвечает 200, а в теле лежит `{ "error": "..." }`. `expect(response.ok()).toBe(true)` проходит, отчёт зелёный, баг уезжает в прод. Читайте тело, прежде чем доверять статусу.

**Сводки, которые не сходятся.** Эндпоинт-сводка — это вторая, независимая реализация той же арифметики, что и списочный эндпоинт. `GET /accounts/summary` может противоречить сумме `GET /accounts`, при том что оба вернут 200. Сравнивайте их; кроме вас этого не сделает никто.

**Дыры в валидации.** Отправляйте то, чего интерфейс не отправляет: отрицательную сумму, пустую строку, пропущенное поле, id чужого аккаунта. Принятый невалидный payload — это находка, а не падение теста, которое нужно заглушить.

**Тесты, проходящие по неверной причине.** Если тест зелёный потому, что вы ничего не проверили, или потому, что проверка была `expect(body).toBeDefined()`, тест съедает время и не даёт ничего. Когда тест падает, читайте сообщение: оно описывает баг или ваш тест?

**Данные, которые живут дольше прогона.** Созданные записи без уборки ломают второй запуск, а различить «сломано» и «грязно» — это полдня работы. Генерируйте уникальные значения на прогон (отметка времени или run id в имени) и удаляйте за собой.

## Цепочка в одном тесте, читаемая в отчёте

Пять вызовов подряд в одной функции невозможно читать, когда падает четвёртый. `test.step` называет каждое бизнес-действие, и отчёт указывает на сломавшийся шаг:

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

Какие запросы заслуживают теста? Те, от которых зависит клиент, и те, где две ветки кода считают одно и то же. Эндпоинт-форматтер или статический health check добавляют время прогона и ничего не дают.

## Сначала проверка руками, потом автоматизация

Прежде чем писать тест, сформулируйте проверку словами и выполните её один раз руками — через `curl`, `httpie` или панель Network в браузере. Порядок важен: тест с неверным ожиданием хуже отсутствия теста, потому что выглядит как покрытие.

В отчёт по каждому падению API кладите две вещи: точный запрос (метод, путь, payload) и точный ответ (статус, тело). Эта пара нужна разработчику — и она же делает ваш тест воспроизводимым.

## Откуда берётся цель

Для упражнений этого модуля публичный сервис не нужен. По умолчанию ваш AI-агент поднимает крошечный mock API на Node прямо в вашем репозитории — REST-сервис аккаунтов и заказов, который вы полностью контролируете, поэтому тесты идут офлайн и детерминированно. Известный публичный тренировочный API (jsonplaceholder.typicode.com, httpbin.org, petstore.swagger.io) — хороший запасной вариант, когда хочется посмотреть те же приёмы на чужом контракте; оба пути дают одни и те же навыки.

Переходите к практическим задачам модуля: сначала тесты уровня запроса со статусами и контрактом ошибок, затем цепочка, проверяющая состояние после каждого шага.
