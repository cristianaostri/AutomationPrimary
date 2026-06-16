# Skill: code-review

Revisá step definitions, feature files y archivos de soporte del proyecto OneClearing buscando anti-patterns conocidos y violaciones a las convenciones del CLAUDE.md.

## ALCANCE

Revisar siempre que se cree o modifique:
- `cypress/e2e/step_definitions/**/*.js`
- `cypress/e2e/features/**/*.feature`
- `cypress/support/commands.js`
- `cypress/support/db-task.js`
- `cypress/support/page-objects/**/*.js`

## CHECKLIST DE ANTI-PATTERNS

### 🔴 CRÍTICO — Rompen el test en tiempo de ejecución

**Token a nivel módulo** (el bug más frecuente del proyecto):
```js
// ❌ INCORRECTO — se lee antes de que loginViaApi() corra
const HEADERS = { Authorization: `Bearer ${Cypress.env('accessToken')}` };

// ✅ CORRECTO — se lee dentro de cada step
When('...', () => {
  const token = Cypress.env('accessToken');
  cy.request({ headers: { Authorization: `Bearer ${token}` } });
});
```

**`cy.env()` en lugar de `Cypress.env()`**:
```js
// ❌ INCORRECTO — cy.env() no existe, retorna undefined silenciosamente
const url = cy.env('mainApiUrl');

// ✅ CORRECTO
const url = Cypress.env('mainApiUrl');
```

**Arrow function con `this.alias`**:
```js
// ❌ INCORRECTO — `this` es undefined en arrow function
When('...', () => {
  const ids = this.caratulasIds; // undefined
});

// ✅ CORRECTO
When('...', function () {
  const ids = this.caratulasIds; // funciona
});
```

**Falta de `return` en chains de `cy.task()`**:
```js
// ❌ INCORRECTO — Cypress no puede encadenar las promesas
When('...', () => {
  cy.task('queryOC', sql1).then(() => {
    cy.task('queryACSA', sql2); // sin return
  });
});

// ✅ CORRECTO
When('...', () => {
  return cy.task('queryOC', sql1).then(() => {
    return cy.task('queryACSA', sql2);
  });
});
```

### 🟡 ADVERTENCIA — Fragilidad y mantenibilidad

**Datos hardcodeados en steps** (deben ir a fixtures):
```js
// ❌ INCORRECTO
cy.request({ body: { username: 'admin', password: '1234' } });

// ✅ CORRECTO
cy.fixture('api/auth/credentials').then(creds => {
  cy.request({ body: creds });
});
```

**Path de DB incompleto**:
```js
// ❌ INCORRECTO — puede resolver contra DB equivocada
'SELECT * FROM Caratula.Caratula'

// ✅ CORRECTO — siempre 3 partes: DB.Schema.Tabla
'SELECT * FROM OneClearing_Entregas.Caratula.Caratula'
```

**Reusar conexión de DB entre steps** (db-task.js abre y cierra por llamada):
```js
// ❌ INCORRECTO — no existe un pool compartido en este proyecto
let dbConnection;
Before(() => { dbConnection = openDB(); });

// ✅ CORRECTO — cada cy.task() abre y cierra su propia conexión
cy.task('queryOC', sql);
```

**Response body sin fallback defensivo**:
```js
// ❌ INCORRECTO — rompe si la API cambia el envelope
const items = response.body.items;

// ✅ CORRECTO
const items = response.body.items || response.body.data || 
              (Array.isArray(response.body) ? response.body : []);
```

### 🔵 CONVENCIÓN — Estilo y consistencia

**Feature sin tag de tipo**:
```gherkin
# ❌ Sin tag — no entra en ninguna suite filtrada
Scenario: Crear operación

# ✅ Con tags apropiados
@api @regression
Scenario: Crear operación
```

**Step duplicado** — antes de crear un step, buscar en toda la carpeta `step_definitions/` si ya existe uno con la misma regex o texto similar. Si existe, referenciar el archivo donde está.

**`failOnStatusCode` faltante** cuando el step valida el status manualmente:
```js
// ❌ Cypress lanza error antes de que llegue al expect
cy.request({ method: 'POST', url, body }).then(res => {
  expect(res.status).to.eq(400);
});

// ✅ Con failOnStatusCode: false
cy.request({ method: 'POST', url, body, failOnStatusCode: false }).then(res => {
  expect(res.status).to.eq(400);
});
```

## FORMATO DE REPORTE

Para cada archivo revisado:

```
📄 {path/al/archivo}

✅ Sin problemas   |   ❌ {N} problemas encontrados

[Por cada problema]
  Línea {N}: {CRÍTICO | ADVERTENCIA | CONVENCIÓN}
  Descripción: {qué está mal}
  Fix: {código corregido}
```

Si no hay problemas: `✅ {archivo} — cumple todas las convenciones del proyecto.`

## REGLA FINAL

Nunca aprobar un archivo que tenga al menos un problema CRÍTICO. Si se encuentra uno, bloquearlo y proponer el fix antes de continuar con la generación o ejecución.
