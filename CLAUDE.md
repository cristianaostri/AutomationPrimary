# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cypress + Cucumber (BDD) automation framework for **OneClearing** — a financial clearing platform. Tests cover three layers: REST API, frontend UI, and direct SQL database queries against two MSSQL databases (OneClearing and ACSA).

## Prerequisites

- Node.js 18+, Google Chrome, OpenConnect (VPN for Linux)
- `.env.vpn` and `cypress/connect_vpn.sh` must exist locally (excluded from git)
- VPN must be active before running any test (all targets are internal IPs)

## Commands

```bash
npm install                  # install dependencies
npm run vpn:connect          # connect to VPN (required before running tests)

# Interactive runner
npm run cy:open              # open Cypress UI (default env: qa)
npm run cy:open:dev          # open with CYPRESS_ENV=dev
npm run cy:open:qa           # open with CYPRESS_ENV=qa
npm run cy:open:uat          # open with CYPRESS_ENV=uat

# Headless runs by environment
npm run test:dev             # run against dev
npm run test:qa              # run against qa
npm run test:uat             # run against uat

# Run with tag filter (filterSpecs + omitFilteredSpecs are ON in package.json)
npx cypress run --browser chrome --env CYPRESS_ENV=qa,TAGS="@api"
npx cypress run --browser chrome --env CYPRESS_ENV=qa,TAGS="@regression"
npx cypress run --browser chrome --env CYPRESS_ENV=qa,TAGS="@caratulas"

# Run a single feature file
npx cypress run --browser chrome --spec "cypress/e2e/features/api/caratulas/caratulas_full_audit.feature"

# Full run + report generation
npm run test:master          # clean → run → merge → generate → rename → open
```

## Architecture

### Directory Layout

```
cypress/
├── e2e/
│   ├── features/                    # Gherkin .feature files
│   │   ├── api/
│   │   │   ├── caratulas/           # caratulas_full_audit.feature, firmarCaratular.feature
│   │   │   ├── operaciones/         # crearOe.feature
│   │   │   └── parametros/          # canbioHorario.feature
│   │   ├── db/
│   │   │   ├── acsa/                # inyectar_manual.feature
│   │   │   └── caratulas/           # db_caratula.feature
│   │   └── front/
│   │       └── Login/               # login.feature
│   └── step_definitions/            # JS step implementations (mirrors features/ structure)
│       ├── api/
│       │   ├── caratulas/           # flujoCaratulacionSteps.js, getCaratula.js
│       │   ├── operaciones/         # oeSteps.js
│       │   └── parametros/          # cambioHorarioSteps.js
│       ├── common/                  # loginSteps.js
│       ├── db/
│       │   ├── acsa/                # db_acsa_steps.js
│       │   └── caratulas/           # db_caratula_steps.js
│       ├── hooks.js                 # Global Before hooks by tag
│       └── loginSteps.js            # Frontend login steps
├── fixtures/
│   └── api/operaciones/
│       └── crearOferta.json         # Base payload for OE creation
├── reports/                         # Generated HTML + JSON reports
├── support/
│   ├── commands.js                  # cy.loginViaApi() custom command
│   ├── db-task.js                   # Cypress task registrations (MSSQL)
│   ├── e2e.js                       # Global support file (imports commands + reporter)
│   ├── environments/
│   │   ├── dev.js
│   │   ├── qa.js
│   │   └── uat.js
│   └── page-objects/
│       └── front/
│           └── LoginPage.js
```

### Three Test Types

| Type     | Tag           | Hook                      | Mechanism                                              |
|----------|---------------|---------------------------|--------------------------------------------------------|
| API      | `@api`        | `cy.loginViaApi()`        | `cy.request()` + Bearer token from `Cypress.env('accessToken')` |
| Frontend | `@front`      | `LoginPage.visit/login()` | Cypress UI + Page Object pattern                       |
| Database | (none needed) | —                         | `cy.task('queryOC', sql)` or `cy.task('queryACSA', sql)` |

> **Note:** DB tests have no `@db` hook in `hooks.js`. They connect via tasks that use the config loaded at startup — no explicit login is required.

### Tags in Use

| Tag          | Scope                                        |
|--------------|----------------------------------------------|
| `@api`       | Triggers API login hook; marks API scenarios |
| `@front`     | Triggers frontend login hook                 |
| `@regression`| Regression suite inclusion                   |
| `@backend`   | Backend/contract validation                  |
| `@caratulas` | Caratulas feature area                       |
| `@operaciones`| Operaciones feature area                   |

Tags can be placed at the `Feature:` line (all scenarios inherit) or per `Scenario:`.

### Hooks (`cypress/e2e/step_definitions/hooks.js`)

```js
Before({ tags: "@api" }, () => { cy.loginViaApi(); });
Before({ tags: "@front" }, () => { LoginPage.visit(); LoginPage.login("cris", "cris"); });
```

`cy.loginViaApi()` (defined in `commands.js`) POSTs to `/Auth/Token` with `form: true`, stores the token in `localStorage` via `cy.session`, then re-syncs it into `Cypress.env('accessToken')` so all steps can read it.

### Environment Configuration

`cypress.config.js` loads the active env from `cypress/support/environments/{env}.js` at Node startup.
Resolved order: `config.env.CYPRESS_ENV` → `process.env.CYPRESS_ENV` → `'qa'`.

Each environment file exports:

```js
{
  baseUrl, authApiUrl, mainApiUrl, portfolioApiUrl,
  apiUser, apiPassword, apiApplication,
  frontendUser, frontendPassword,
  featureFlagA,                         // boolean flag, currently unused
  dbOneClearing,                        // DB name: 'OneClearing_Entregas'
  dbOCuser, dbOCpassword,
  dbACSA,                               // DB name: 'acsa_clearing_testing'
  dbACSAuser, dbACSApassword
}
```

DB server IPs (set in `cypress.config.js`, not in the env files):
- OneClearing DB: `192.168.139.160` (dev) / `192.168.139.161` (qa, uat)
- ACSA DB: `192.168.99.62` (fixed across all envs)

### Database Tasks (`cypress/support/db-task.js`)

| Task                              | DB           | Description                                              |
|-----------------------------------|--------------|----------------------------------------------------------|
| `cy.task('queryOC', sql)`         | OneClearing  | Generic SELECT query, returns `recordset[]`              |
| `cy.task('queryACSA', sql)`       | ACSA         | Generic SELECT query, returns `recordset[]`              |
| `cy.task('getLatestOpeMercado', dateYYYYMMDD)` | ACSA | Returns `MAX(OperacionMercadoID)` for the given date |
| `cy.task('createCarteraManual', data)` | ACSA   | Executes `Registro.InsertOperacionCarteraManual` stored procedure |

DB table path convention: `DatabaseName.SchemaName.TableName` (e.g., `OneClearing_Entregas.Caratula.Caratula`).

`db-task.js` opens a new connection per call and closes it in `finally` — do not pool or reuse connections between tasks.

### API Endpoints (documented from existing steps)

All API steps read the base URL from `Cypress.env('mainApiUrl')` and attach `Authorization: Bearer ${Cypress.env('accessToken')}`.

| Method | Path                              | Used in                       |
|--------|-----------------------------------|-------------------------------|
| POST   | `/Auth/Token`                     | `commands.js` (login)         |
| GET    | `/Caratulas`                      | `getCaratula.js`              |
| GET    | `/Caratulas?estado=pendienteFirma`| `flujoCaratulacionSteps.js`   |
| POST   | `/Caratulas/Firmar`               | `flujoCaratulacionSteps.js`   |
| POST   | `/Caratulas/CaratulacionDefinitiva` | `flujoCaratulacionSteps.js` |
| GET    | `/Operaciones/GetOperacionesAll`  | `oeSteps.js`                  |
| POST   | `/Ofertas`                        | `oeSteps.js`                  |
| PUT    | `/Parametros`                     | `cambioHorarioSteps.js`       |

Common query params for `/Operaciones/GetOperacionesAll`: `LadoID`, `MesDeEntregaRango`, `DatosPortfolio`, `PageIndex`, `PageSize`, `OrderBy`.

### Response Body Patterns

The API uses inconsistent envelope shapes. Steps use defensive fallback patterns:

```js
// Array extraction
const data = response.body.items || response.body.data || (Array.isArray(response.body) ? response.body : []);

// ID extraction after POST
const id = res.body.id || res.body.value || (res.body.data ? res.body.data.id : null);
```

### Step Definitions — Coding Conventions

**Imports:** ES module syntax throughout.
```js
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
```

**Module-level variables** are used to pass data between steps in the same file:
```js
let apiResponse;   // set in When, read in Then
let caratulas;
```
Prefer `cy.wrap(value).as('alias')` + `cy.get('@alias')` for sharing across *different* step files.

**Aliases and `this`:** When using `this.aliasName`, the callback must be `function()` not an arrow function:
```js
When('...', function () {
  const ids = this.caratulasIds;  // works
});
```

**Token access:** Always read the token inline, not at module level:
```js
// Correct — read at step execution time
const token = Cypress.env('accessToken');

// Incorrect — reads before session is established (avoid this pattern)
const HEADERS = { Authorization: `Bearer ${Cypress.env('accessToken')}` };
```

**`failOnStatusCode: false`** is used when the step manually asserts the status, to prevent Cypress from throwing before the assertion.

**`return`** must be added when chaining multiple `cy.task()` calls so Cypress handles promises correctly (see `db_acsa_steps.js`).

### Fixture Data (`cypress/fixtures/api/operaciones/crearOferta.json`)

Base payload for OE creation. In "auto" mode (`oeSteps.js`), the `operaciones[]` array is replaced with live data from `GET /Operaciones/GetOperacionesAll` before POSTing.

### Page Object Pattern

`LoginPage` (`cypress/support/page-objects/front/LoginPage.js`) exposes:
- `elements` — object of getter functions returning `cy.get()` locators
- `visit()` — calls `cy.visit(Cypress.env('baseUrl'))`
- `login(username, password)` — types credentials and clicks submit

Export as singleton: `export default new LoginPage();`

### Reporting

`cypress-mochawesome-reporter` — JSON files accumulate in `cypress/reports/temp_jsons/`. `npm run test:master` chains:
1. `clean:reports` — deletes `cypress/reports/`
2. `test:run` — runs tests
3. `report:merge` — merges all JSONs into `master_report.json`
4. `report:generate` — generates HTML
5. `report:rename` — renames with `report_{env}_{YYYYMMDD_HHMM}.html`
6. `report:open` — opens the latest HTML with `xdg-open`
7. `clean:temp` — removes `temp_jsons/`

## Known Issues / Gotchas

- **`uat.js`** currently points to dev URLs (`oneclearing.dev.primary`) — should use `oneclearing.uat.primary`.
- **`oeSteps.js`** defines `const HEADERS` at module level, which reads the token before `cy.loginViaApi()` runs. This means `HEADERS` is always empty on first use. Inline token reads inside each step are the correct pattern.
- **`loginSteps.js` (common/)** uses `cy.env()` instead of `Cypress.env()` — this will silently return `undefined`.
- DB feature files don't use `@db` tag (the tag is not wired to any hook anyway). DB steps work without hooks.
- `cypress/e2e/1-getting-started/` and `2-advanced-examples/` are Cypress defaults and are **not picked up** by `specPattern: "cypress/e2e/features/**/*.feature"`.

## Suggested Skills and MCPs

### Skills to use in this project

| Skill            | When to use                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `run`            | Run the test suite or a specific feature and observe output                 |
| `verify`         | Confirm a new test scenario actually passes before committing               |
| `code-review`    | Review new step definitions for anti-patterns before pushing                |
| `fewer-permission-prompts` | After adding new `cy.task` calls, allowlist them to reduce prompts |

### MCP: Google Drive

The **Google Drive MCP** (`mcp__claude_ai_Google_Drive__*`) is available in this session. Useful for:
- Uploading generated HTML reports (`cypress/reports/report_*.html`) to share with the QA team
- Reading test plan documents or requirements stored in Drive
- Saving fixture data or test data spreadsheets

To use: ask Claude to read/upload files from/to Drive after a test run.

### No additional MCP needed

This project talks to internal APIs and MSSQL databases over VPN — no external service MCP (Jira, Slack, etc.) is required unless issue tracking or notifications are added later.
