# Skill: jira-link

Conectá un ticket de Jira con los tests de Cypress: leé los criterios de aceptación, generá los scenarios Gherkin correspondientes y actualizá el ticket cuando el test pasa.

## FLUJO COMPLETO

```
Ticket Jira (historia + criterios)
        ↓
  Extraer criterios de aceptación
        ↓
  Mapear a Scenarios Gherkin
        ↓
  Generar feature + steps (usar skill generate-test o swagger-to-test)
        ↓
  Agregar referencia del ticket en el .feature
        ↓
  [Cuando pasa] Actualizar estado en Jira
```

## PASO 1 — LEER EL TICKET

Si está conectado el MCP de Jira, pedir el ticket directamente:
> "Leé el ticket OC-1234"

Si no está disponible el MCP, pedirle al usuario que pegue:
- Título de la historia
- Descripción (criterios de aceptación en formato "Como... Quiero... Para..." o lista de condiciones)
- Tipo: Historia / Bug / Task

## PASO 2 — EXTRAER CRITERIOS DE ACEPTACIÓN

Identificar en el ticket cada condición verificable. Cada condición = un Scenario.

Ejemplos de conversión:

| Criterio del ticket | Scenario Gherkin |
|---|---|
| "El usuario puede firmar carátulas pendientes" | `Scenario: Firma exitosa de carátulas en estado pendiente` |
| "No se puede firmar una carátula ya firmada" | `Scenario: Error al intentar firmar carátula ya firmada` |
| "El tiempo de respuesta debe ser < 1 segundo" | `Scenario: Performance de firma dentro del límite aceptable` |
| "El cambio de estado queda registrado en DB" | `Scenario: Persistencia del estado en base de datos tras firma` |

Reglas de extracción:
- Un criterio de aceptación = un Scenario (no juntar dos criterios en uno)
- Los criterios negativos ("no se puede", "no debe") = Scenario con caso de error
- Los criterios de performance = Scenario con assertion de tiempo de respuesta
- Los criterios de persistencia = Scenario con validación DB (usar skill db-seed)

## PASO 3 — AGREGAR REFERENCIA AL TICKET

En el `.feature`, documentar el ticket de origen en cada Scenario:

```gherkin
@api @regression
Feature: Firma de Carátulas
  # Origen: OC-1234 — Historia: Firma masiva de carátulas pendientes
  # MCP Jira: https://oneclearing.atlassian.net/browse/OC-1234

  @api @regression
  # Criterio: "El usuario puede firmar carátulas pendientes"
  Scenario: Firma exitosa de carátulas en estado pendiente
    Given que tengo acceso a la API de OneClearing
    When obtengo la lista de carátulas en estado pendienteFirma
    And realizo la firma masiva de las carátulas encontradas
    Then la respuesta debe tener un status 200

  @api @regression
  # Criterio: "No se puede firmar una carátula ya firmada"
  Scenario: Error al intentar firmar carátula ya firmada
    Given que tengo acceso a la API de OneClearing
    When intento firmar una carátula en estado firmada
    Then la respuesta debe tener un status 400
```

## PASO 4 — TRAZABILIDAD INVERSA

En el archivo de step definitions, agregar el ticket como comentario en el header:

```js
// Ticket: OC-1234 — Firma masiva de carátulas
// Feature: cypress/e2e/features/api/caratulas/firmarCaratulas.feature
// Generado: {fecha}
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
```

## PASO 5 — ACTUALIZAR JIRA CUANDO EL TEST PASA

Si el MCP de Jira está disponible, después de una ejecución exitosa:

1. Identificar qué tickets están cubiertos por los tests que pasaron (leer los comentarios `# Origen: OC-XXXX` en los features)
2. Agregar comentario en el ticket:
   ```
   ✅ Test automatizado pasó — {fecha}
   Suite: {tag o nombre del feature}
   Ambiente: {qa|uat}
   Tiempo: {Xs}
   Reporte: {link al HTML en Drive si está disponible}
   ```
3. Si el ticket está en estado "En testing" y todos sus criterios tienen test que pasan → proponer moverlo a "Listo para deploy" (confirmar con el usuario antes de hacerlo)

## PASO 6 — CUANDO EL TEST FALLA

Si un test vinculado a un ticket falla en CI o en ejecución manual:

1. Identificar el ticket del comentario en el feature
2. Determinar si es fallo de test (código) o fallo de comportamiento (bug real)
3. Si es bug real → crear sub-task o bug en Jira bajo el ticket padre con:
   - Descripción del fallo
   - Ambiente donde falló
   - Output de Cypress (primeras 10 líneas del error)
4. Si es fallo de código del test → no crear ticket, solo reparar el step

## MAPEO DE TAGS POR TIPO DE TICKET

| Tipo de ticket Jira | Tags en Gherkin |
|---|---|
| Historia nueva | `@api @regression @wip` (sacar `@wip` al aprobar) |
| Bug reportado | `@api @smoke` (verificar que no vuelve a aparecer) |
| Regresión detectada | `@regression @backend` |
| Test de performance | `@api @regression` (sin tag especial) |
| Test de datos / DB | `@api @regression @db` + advertir VPN |

## OUTPUT ESPERADO

```
📋 Ticket: OC-{N} — {Título}
Criterios encontrados: {N}
Scenarios generados: {N}

📁 Archivos:
  NUEVO/EXTENDIDO  cypress/e2e/features/api/{modulo}/{archivo}.feature
  NUEVO            cypress/e2e/step_definitions/api/{modulo}/{archivo}Steps.js

🔗 Trazabilidad agregada en: líneas {N}-{N} del feature

Para ejecutar solo los tests de este ticket:
  npx cypress run --browser chrome --env CYPRESS_ENV=qa \
    --spec "cypress/e2e/features/api/{modulo}/{archivo}.feature"
```
