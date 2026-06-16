# Skill: swagger-to-test

Dado un endpoint de la API de OneClearing (desde el Swagger, una URL, o descripción), generá el `.feature`, los `step_definitions` y el fixture JSON completo listos para correr.

## ENTRADA ACEPTADA

- URL del endpoint: `POST /Caratulas/Firmar`
- Descripción en lenguaje natural: "quiero testear que firmar carátulas devuelve 200"
- JSON del Swagger: pegar el objeto del path directamente
- Colección de Postman: leer el request correspondiente

## PASO 1 — RELEVAMIENTO PREVIO

Antes de crear cualquier archivo, leer:

```
cypress/e2e/features/api/{modulo}/
cypress/e2e/step_definitions/api/{modulo}/
cypress/fixtures/api/{modulo}/
```

Determinar:
- ¿Ya existe un `.feature` para este módulo? → agregar el scenario ahí, no crear archivo nuevo
- ¿Ya existen steps reutilizables? → referenciarlos, no duplicarlos
- ¿Ya existe un fixture para este endpoint? → extenderlo

## PASO 2 — ANÁLISIS DEL ENDPOINT

Extraer del Swagger o descripción:
- Method + path
- Parámetros requeridos (query, path, body)
- Tipo de autenticación (Bearer token en este proyecto: siempre)
- Posibles status codes de respuesta (200, 204, 400, 404, 422...)
- Shape del response body (identificar la propiedad raíz: `value`, `data`, `items`, o array directo)

## PASO 3 — GENERACIÓN

### 3a. Feature file

Path: `cypress/e2e/features/api/{modulo}/{nombre}.feature`

Estructura mínima con escenario happy path + un escenario negativo:

```gherkin
@api @regression
Feature: {Nombre del módulo} — {descripción breve}

  @api @regression
  Scenario: {Nombre happy path}
    Given que tengo acceso a la API de OneClearing
    When {acción en lenguaje de negocio}
    Then la respuesta debe tener un status {200|204}
    And {validación del response body}

  @api @regression  
  Scenario: {Nombre caso negativo — dato inválido}
    Given que tengo acceso a la API de OneClearing
    When {acción con dato inválido}
    Then la respuesta debe tener un status {400|404|422}
```

Reglas:
- Steps en español, en lenguaje de negocio (no técnico)
- No mencionar "Bearer token", "JSON", "request" en el Gherkin
- Agregar `@wip` al escenario si está en desarrollo

### 3b. Step definitions

Path: `cypress/e2e/step_definitions/api/{modulo}/{nombre}Steps.js`

Plantilla base (adaptar por endpoint):

```js
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ✅ URL leída inline — nunca a nivel módulo con Cypress.env()
// ✅ Token leído dentro de cada step — nunca const TOKEN = Cypress.env(...) arriba

When('{texto del step}', () => {
  const token = Cypress.env('accessToken');
  const url = Cypress.env('mainApiUrl');

  cy.fixture('{modulo}/{fixture}').then((body) => {
    cy.request({
      method: '{METHOD}',
      url: `${url}/{path}`,
      headers: { Authorization: `Bearer ${token}` },
      body,
      failOnStatusCode: false   // incluir si el step valida el status manualmente
    }).then((response) => {
      cy.wrap(response).as('apiResponse');
    });
  });
});

Then('la respuesta debe tener un status {int}', (expectedStatus) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.status).to.eq(expectedStatus);
  });
});

Then('{validación del body}', () => {
  cy.get('@apiResponse').then((response) => {
    // Fallback defensivo siempre
    const items = response.body.items 
      || response.body.data 
      || response.body.value
      || (Array.isArray(response.body) ? response.body : []);
    expect(items).to.not.be.empty;
  });
});
```

Reglas críticas:
- Token: `const token = Cypress.env('accessToken')` DENTRO de cada step, nunca afuera
- URL base: `Cypress.env('mainApiUrl')` inline
- Si el step usa `this.alias` → usar `function()` no arrow function
- Si encadena múltiples `cy.task()` → agregar `return`
- `failOnStatusCode: false` cuando el step valida el status con `expect`

### 3c. Fixture

Path: `cypress/fixtures/api/{modulo}/{nombre-endpoint}.json`

Contener solo los campos requeridos por el endpoint. Para arrays de IDs (como en Firmar/CaratulacionDefinitiva), usar IDs ficticios de ejemplo:

```json
{
  "{campo1}": "{valor_ejemplo}",
  "{campo2}": 0
}
```

Nunca datos reales de producción ni credenciales.

## PASO 4 — VALIDACIONES AUTOMÁTICAS SEGÚN TIPO

Para endpoints GET de listado, siempre incluir:
- Status 200
- Response no vacío
- Campos clave presentes y no nulos

Para endpoints POST de creación:
- Status 200/201/204
- ID del recurso creado disponible en response (`id || value || data.id`)
- `cy.wrap(id).as('nuevoId')` para encadenar en siguientes steps

Para endpoints PUT/PATCH:
- Status 200/204
- GET posterior que confirma el cambio

Para endpoints DELETE:
- Status 200/204
- GET posterior que confirma que ya no existe (status 404)

Para endpoints que interactúan con DB (como Firmar/CaratulacionDefinitiva):
- Agregar step de validación DB con `cy.task('queryOC', sql)` que confirme el estado en `OneClearing_Entregas.{Schema}.{Tabla}`

## PASO 5 — OUTPUT FINAL

Listar todos los archivos creados o modificados:

```
📁 Archivos generados:
  NUEVO   cypress/e2e/features/api/{modulo}/{archivo}.feature
  NUEVO   cypress/e2e/step_definitions/api/{modulo}/{archivo}Steps.js
  NUEVO   cypress/fixtures/api/{modulo}/{fixture}.json

📁 Archivos modificados:
  EXTENDIDO  cypress/e2e/features/api/{modulo}/{existente}.feature (agregado Scenario línea N)

⚠️  Requiere VPN activa (tun0) para ejecutar — los endpoints apuntan a IPs internas.

Para ejecutar:
  npx cypress run --browser chrome --env CYPRESS_ENV=qa \
    --spec "cypress/e2e/features/api/{modulo}/{archivo}.feature"
```
