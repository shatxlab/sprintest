# Архитектура тестов: фикстуры и изоляция

Локаторы и ассерты делают отдельный тест надёжным. Архитектура решает, надёжен ли весь набор. Файл из десяти тестов, который проходит только в одном порядке, на одной машине и в один поток, — это не набор тестов, а скрипт с лишними шагами.

Этот модуль — про слой над телом теста: конфиг, который задаёт форму запуска, фикстуры, которые поставляют подготовку, и дисциплину, которая даёт каждому тесту собственную чистую среду.

## playwright.config.ts: форма запуска

Файл конфигурации — это проектный документ. Прочитав его, вы понимаете, можно ли доверять набору в CI, ещё до первого запуска.

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
```

Основную работу делают четыре настройки. `fullyParallel: true` разрешает тестам внутри одного файла идти одновременно — именно так и всплывают скрытые зависимости между ними. `workers` ограничивает параллельность, чтобы расход ресурсов оставался предсказуемым. `retries` держим низким: повторы — это диагностика, а не лечение. `trace: "retain-on-failure"` означает, что каждый падёж приходит вместе с доказательствами, и для отладки не нужно воспроизводить его локально.

Полезная привычка: прогнать набор один раз с `--workers=1` и один раз с `--workers=4`. Если результаты различаются — у вас дефект изоляции, и честным считается второй прогон.

## Фикстуры: названная подготовка без скрытого состояния

`beforeEach` и вспомогательные функции выталкивают состояние во внешнюю область видимости. Фикстуры лучше: каждый тест явно объявляет, что ему нужно, а порядок, безопасность при параллельном запуске и очистку берёт на себя фреймворк.

```ts
import { test as base, expect } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

type Fixtures = {
  todoApi: APIRequestContext;
  seededList: { id: string; name: string };
};

export const test = base.extend<Fixtures>({
  todoApi: async ({ request }, use) => {
    const context = await request.newContext({ baseURL: "http://localhost:3100" });
    await use(context);
    await context.dispose();
  },
  seededList: async ({ todoApi }, use) => {
    const name = `QA list ${crypto.randomUUID()}`;
    const response = await todoApi.post("/api/lists", { data: { name } });
    expect(response.ok()).toBeTruthy();
    const { id } = await response.json();
    await use({ id, name });
    await todoApi.delete(`/api/lists/${id}`);
  },
});
```

Теперь тест читается как замысел, а не как сантехника:

```ts
test("renames a list", async ({ page, seededList }) => {
  await page.goto(`/lists/${seededList.id}`);
  await page.getByRole("button", { name: "Rename" }).click();
  await page.getByLabel("List name").fill(`${seededList.name} v2`);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${seededList.name} v2`);
});
```

Фикстура создаёт данные, нужные тесту, и удаляет их после. Фикстуры композируются: `seededList` получает `todoApi`, а Playwright разрешает этот граф для каждого теста отдельно. Ничего не протекает между тестами, даже когда они идут параллельно в одном воркере.

## Изоляция: авторизация без танцев с логином

Проходить логин через интерфейс в каждом тесте — долго, и это превращает страницу входа в единую точку отказа всего набора. Сохраните состояние авторизованного браузера один раз и переиспользуйте его.

```ts
import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("qa@example.com");
  await page.getByLabel("Password").fill("qa-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
```

Проект `setup` выполняется первым, браузерный проект зависит от него. В файле состояния лежат cookie и данные браузерного хранилища, поэтому тест стартует уже авторизованным. Оставьте хотя бы один тест, который делает настоящий вход: сохранённое состояние скрывает регрессии авторизации, если поток никто не проверяет напрямую. Файл состояния и учётные данные за ним никогда не коммитим.

## Тестовые данные: создавать, а не наследовать

Зависимость от порядка — самая частая причина наборов, которые проходят локально и падают в CI. Виновный шаблон легко узнать:

```ts
let createdListId: string; // module scope: shared between tests

test("creates a list", async ({ page }) => {
  // ... createdListId = extracted from the page
});

test("renames the list", async ({ page }) => {
  await page.goto(`/lists/${createdListId}`); // depends on run order
});
```

Каждый тест предполагает, что предыдущий успел выполниться и завершиться успешно. При параллельном запуске это допущение умирает сразу; при `--repeat-each`, повторах или перемешанном порядке оно умирает тише — и это хуже. Лечится это не сортировкой тестов, а тем, что каждый тест получает нужные данные сам, через фикстуру, со значениями, уникальными для теста (UUID в имени, а не фиксированное имя).

Список запахов для ревью:

- переменная объявлена вне `test()` и записывается внутри него;
- тест проходит только после того, как отработал другой тест;
- фиксированное имя, идентификатор или email переиспользуются в нескольких тестах;
- очистка вынесена в отдельный «последний» тест;
- `test.describe.serial` прикрывает зависимость;
- повтор делает падение невидимым.

Каждый пункт означает, что один тест одалживает состояние у другого. Правильное исправление всегда одно: тест создаёт то, что ему нужно.

## Page objects и хелперы

Page objects в Playwright не обязательны, и лучше всего стареют тонкие. Инкапсулируйте навигацию и повторяющиеся многошаговые действия; ассерты оставляйте в тесте, чтобы читатель видел ожидание без второго файла. Page object с десятью ассертами и бизнес-логикой становится местом, где падения прячутся. Если хелперу постоянно нужен `expect`, спросите себя: может, это уже тест?

## Правила, которые стоит унести

- Подготовка живёт в фикстуре, а не в `beforeEach` с общими переменными.
- Каждый тест создаёт свои данные и убирает их в том же тесте или фикстуре.
- Состояние авторизации создаётся один раз, переиспользуется осознанно и хотя бы раз проверяется напрямую.
- Конфиг читаем как доказательство: параллельность, воркеры и повторы говорят, насколько честен набор.
- Набор, который проходит только в одном порядке, сломан независимо от цвета отчёта.

В практической задаче вы получите работающий — и продублированный — набор. Ваша задача — превратить его в архитектуру.
