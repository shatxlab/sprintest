# Тестирование SOAP API

SOAP — протокол обмена структурированными сообщениями между системами. Он часто встречается в enterprise-интеграциях, банках, страховании, госуслугах и старых service-oriented архитектурах. Обычно SOAP передаётся по HTTP и обычно использует XML.

QA-инженер при тестировании SOAP фокусируется на контракте сообщения: XML-структуре, namespaces, правилах схемы, WSDL-описании, названиях операций, headers, faults и совместимости с клиентскими системами.

## Основы XML

XML хранит структурированные данные через именованные элементы и атрибуты.

```xml
<employee>
  <firstName>Anna</firstName>
  <lastName>Smith</lastName>
  <department code="qa">Quality</department>
</employee>
```

Важные детали XML-тестирования:

- Имена элементов чувствительны к регистру.
- Вложенность и порядок могут быть важны, если это задано схемой.
- У атрибутов и текстовых значений могут быть разные правила.
- Namespaces различают элементы с одинаковым локальным именем.
- Пробелы часто незначимы, но текстовое содержимое всё равно важно.

## XSD и валидация

XSD описывает допустимую структуру XML. Схема может задавать обязательные элементы, optional elements, порядок, типы данных, min/max length, числовые границы, перечисления и повторяющиеся группы.

Пример:

```xml
<xs:element name="employee">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="firstName" type="xs:string"/>
      <xs:element name="lastName" type="xs:string"/>
      <xs:element name="startDate" type="xs:date"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

QA-проверки по этой схеме:

- `firstName`, `lastName` и `startDate` присутствуют.
- Элементы идут в заданном порядке.
- `startDate` является валидной датой.
- Неизвестные элементы принимаются только тогда, когда схема разрешает расширение.

Валидация по схеме необходима, но её недостаточно. Сообщение может быть валидным XML и всё равно нарушать бизнес-правило, например дата окончания раньше даты начала.

## WSDL

WSDL описывает SOAP-сервис. Он сообщает клиентам, какие операции существуют, какие сообщения они принимают и возвращают, где расположен сервис и какая SOAP binding применяется.

Ключевые части WSDL:

- **types**: XML-схемы, которые используются сообщениями.
- **message**: части request и response сообщений.
- **portType**: операции, которые предоставляет сервис.
- **binding**: протокол и детали SOAP-стиля.
- **service**: адрес endpoint сервиса.

При ревью WSDL спрашивайте:

- Какие операции публичны?
- Какие поля обязательны для каждой операции?
- Какие namespaces и SOAP actions ожидаются?
- Какие fault messages определены?
- Описаны ли versioning и backward compatibility?

## SOAP envelope

SOAP-сообщение оборачивает бизнес-данные в envelope.

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ord="http://example.test/orders">
  <soapenv:Header>
    <ord:ClientId>partner-17</ord:ClientId>
  </soapenv:Header>
  <soapenv:Body>
    <ord:GetOrderRequest>
      <ord:orderId>ORD-1001</ord:orderId>
    </ord:GetOrderRequest>
  </soapenv:Body>
</soapenv:Envelope>
```

Фокус тестирования:

- Корректный namespace envelope.
- Обязательные header-поля.
- Корректный body element операции.
- Корректный бизнес-payload.
- Fault response, когда сообщение невалидно или операция завершается ошибкой.

## SOAP faults

SOAP faults — структурированные сообщения об ошибках. Полезная проверка убеждается, что failures предсказуемы и безопасны для показа.

Типичные зоны faults:

- Сломанный XML.
- Неверный namespace.
- Отсутствует обязательный элемент.
- Неверный тип данных.
- Неизвестная operation или SOAP action.
- Ошибка авторизации.
- Конфликт бизнес-правила.

Хороший defect report для SOAP включает operation, очищенный от секретов request XML, HTTP status при необходимости, SOAP fault code, fault string или reason и влияние на бизнес.

## Postman, curl и SOAP-инструменты

Postman может отправлять SOAP-запросы через raw XML body, `Content-Type: text/xml` или `application/soap+xml`, а также нужный SOAPAction header для SOAP 1.1 сервисов. curl может воспроизвести тот же запрос обычным текстом.

Пример curl-запроса:

```bash
curl -i 'https://api.example.test/soap/orders' \
  -H 'Content-Type: text/xml; charset=utf-8' \
  -H 'SOAPAction: "GetOrder"' \
  --data @get-order.xml
```

Специализированные инструменты вроде SoapUI умеют импортировать WSDL, генерировать примеры запросов, валидировать схемы и организовывать наборы проверок. Инструмент вторичен; ключевой QA-навык — понять контракт и выбрать содержательные проверки.

## Эвристики тест-дизайна для SOAP

Стройте проверки вокруг:

1. **Contract validity**: XML well-formed и schema-valid.
2. **Namespaces**: корректные prefixes и namespace URIs.
3. **Required headers**: client id, auth token, correlation id, locale.
4. **Business payload**: обычные данные, отсутствующие данные, граничные значения, неверные форматы.
5. **Faults**: предсказуемая структура и безопасные сообщения.
6. **Compatibility**: optional fields, старые клиенты, versioned namespaces.
7. **Transport behavior**: HTTP status, timeout, retry, обработка идемпотентных операций.

## Работа с AI-наставником

Передайте фрагмент WSDL, пример XML и идею проверки. Попросите наставника проверить покрытие по схеме, namespaces, faults и бизнес-правилам. Не просите секретный ожидаемый результат. Если контракт неясен, зафиксируйте неопределённость как вопрос команде сервиса.