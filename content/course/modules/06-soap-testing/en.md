# SOAP API Testing

SOAP is a protocol for exchanging structured messages between systems. It is common in enterprise integrations, banking, insurance, government, and older service-oriented architectures. SOAP usually travels over HTTP and usually carries XML.

A QA engineer testing SOAP focuses on the message contract: XML structure, namespaces, schema rules, WSDL definitions, operation names, headers, faults, and compatibility with client systems.

## XML basics

XML stores structured data with named elements and attributes.

```xml
<employee>
  <firstName>Anna</firstName>
  <lastName>Smith</lastName>
  <department code="qa">Quality</department>
</employee>
```

Important XML testing details:

- Element names are case-sensitive.
- Nesting and order can matter when a schema defines them.
- Attributes and text values may have separate rules.
- Namespaces distinguish elements that have the same local name.
- Whitespace can be insignificant in many places, but text content still matters.

## XSD and validation

XSD describes valid XML structure. It can define required elements, optional elements, allowed order, data types, min/max length, numeric bounds, enumeration values, and repeated groups.

Example:

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

QA checks from this schema:

- `firstName`, `lastName`, and `startDate` are present.
- Elements appear in the defined order.
- `startDate` is a valid date.
- Unknown elements are accepted only when the schema allows extension.

Schema validation is necessary but not enough. A message can be valid XML and still break a business rule, such as an end date before a start date.

## WSDL

WSDL describes a SOAP service. It tells clients which operations exist, what messages they accept and return, where the service is located, and which SOAP binding applies.

Key WSDL parts:

- **types**: XML schemas used by messages.
- **message**: request and response message parts.
- **portType**: operations exposed by the service.
- **binding**: protocol and SOAP style details.
- **service**: service endpoint address.

When reviewing a WSDL, ask:

- Which operations are public?
- Which fields are required for each operation?
- Which namespaces and SOAP actions are expected?
- Which fault messages are defined?
- Are versioning and backward compatibility explained?

## SOAP envelope

A SOAP message wraps business data inside an envelope.

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

Testing focus:

- Correct envelope namespace.
- Required header fields.
- Correct body operation element.
- Correct business payload.
- Fault response when the message is invalid or the operation fails.

## SOAP faults

SOAP faults are structured error messages. A useful test checks that failures are predictable and safe to expose.

Common fault areas:

- Malformed XML.
- Wrong namespace.
- Missing required element.
- Invalid data type.
- Unknown operation or SOAP action.
- Authorization failure.
- Business rule conflict.

A good defect report for SOAP includes the operation, sanitized request XML, HTTP status if relevant, SOAP fault code, fault string or reason, and the business impact.

## Postman, curl, and SOAP tools

Postman can send SOAP requests by using raw XML bodies, `Content-Type: text/xml` or `application/soap+xml`, and the required SOAPAction header for SOAP 1.1 services. curl can reproduce the same request in plain text.

Example curl request:

```bash
curl -i 'https://api.example.test/soap/orders' \
  -H 'Content-Type: text/xml; charset=utf-8' \
  -H 'SOAPAction: "GetOrder"' \
  --data @get-order.xml
```

Specialized tools such as SoapUI can import WSDL files, generate sample requests, validate schemas, and organize suites. The tool is secondary; the important QA skill is understanding the contract and choosing meaningful checks.

## SOAP test design heuristics

Build checks around:

1. **Contract validity**: XML is well-formed and schema-valid.
2. **Namespaces**: correct prefixes and namespace URIs.
3. **Required headers**: client id, auth token, correlation id, locale.
4. **Business payload**: normal data, missing data, boundary values, invalid formats.
5. **Faults**: predictable structure and safe messages.
6. **Compatibility**: optional fields, older clients, versioned namespaces.
7. **Transport behavior**: HTTP status, timeout, retry, idempotent operation handling.

## Working with an AI tutor

Share the WSDL excerpt, sample XML, and your test idea. Ask the tutor to review coverage across schema, namespaces, faults, and business rules. Do not ask for a secret expected result. If the contract is unclear, capture that uncertainty as a question for the service team.