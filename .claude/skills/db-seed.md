# Skill: db-seed

Armá el setup y teardown de datos en MSSQL para que los tests de OneClearing tengan precondiciones controladas y dejen la base limpia después de correr.

## CUÁNDO USAR ESTA SKILL

Usar cuando un test necesita:
- Que exista un registro específico antes de ejecutarse (setup)
- Limpiar los datos que creó al terminar (teardown)
- Verificar que una acción de API o UI persistió correctamente en DB
- Inyectar datos de prueba que no se pueden crear vía API

## BASES DE DATOS DISPONIBLES

| Task Cypress | Base | Uso típico |
|---|---|---|
| `cy.task('queryOC', sql)` | OneClearing_Entregas (192.168.139.161 en qa) | Carátulas, Operaciones, Parámetros |
| `cy.task('queryACSA', sql)` | acsa_clearing_testing (192.168.99.62) | Carteras, Operaciones de mercado |
| `cy.task('createCarteraManual', data)` | ACSA | Stored procedure de inserción |
| `cy.task('getLatestOpeMercado', fecha)` | ACSA | MAX(OperacionMercadoID) del día |

**Regla de conexión**: cada `cy.task()` abre una conexión nueva y la cierra en `finally`. No hay pool compartido — no intentar reusar ni mantener estado entre tasks.

## CONVENCIÓN DE PATH

Siempre usar 3 partes: `BaseDeDatos.Schema.Tabla`

```sql
-- ✅ CORRECTO
SELECT * FROM OneClearing_Entregas.Caratula.Caratula
SELECT * FROM acsa_clearing_testing.dbo.OperacionCartera

-- ❌ INCORRECTO — puede resolver contra DB equivocada
SELECT * FROM Caratula.Caratula
SELECT * FROM OperacionCartera
```

## PATRÓN SETUP — Before/BeforeEach

Para datos que deben existir antes del test, agregarlos en un step `Given` de precondición o en un hook `Before` con tag específico.

### Opción A — Step `Given` en el feature (recomendado)

```gherkin
@api @regression @db
Scenario: Firmar carátula existente
  Given que existe una carátula en estado pendienteFirma en la base
  When realizo la firma de la carátula
  Then la carátula cambia a estado firmada en la base de datos
```

```js
// step_definitions/db/{modulo}/setup_steps.js
import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given('que existe una carátula en estado pendienteFirma en la base', () => {
  // Verificar precondición — no insertar si ya existe
  const checkSql = `
    SELECT TOP 1 CaratulaNumero 
    FROM OneClearing_Entregas.Caratula.Caratula 
    WHERE EstadoId = 1
    ORDER BY FechaCreacion DESC
  `;
  return cy.task('queryOC', checkSql).then((result) => {
    if (!result || result.length === 0) {
      throw new Error('Precondición no cumplida: no hay carátulas en estado pendienteFirma. Crear datos de prueba manualmente o via stored procedure.');
    }
    cy.wrap(result[0].CaratulaNumero).as('caratulaSetup');
  });
});
```

### Opción B — Stored procedure (para ACSA)

```js
Given('que existe una operación de cartera manual en ACSA', () => {
  const data = {
    OperacionMercadoID: 99999,
    CuentaID: 1,
    Cantidad: 100,
    Precio: 1500.00
  };
  return cy.task('createCarteraManual', data).then((result) => {
    cy.log(`Operación insertada con ID: ${JSON.stringify(result)}`);
  });
});
```

## PATRÓN TEARDOWN — After/AfterEach

Para limpiar datos creados por el test, usar un hook `After` con el mismo tag del scenario.

```js
// step_definitions/hooks.js — agregar junto a los hooks existentes
import { After } from "@badeball/cypress-cucumber-preprocessor";

After({ tags: "@cleanup-caratula" }, () => {
  // Solo limpiar datos de test — nunca datos de producción
  // Usar una columna o prefijo que identifique datos de test
  const deleteSql = `
    DELETE FROM OneClearing_Entregas.Caratula.Caratula 
    WHERE Observaciones LIKE '%TEST_AUTO_%'
  `;
  return cy.task('queryOC', deleteSql);
});
```

**Regla de seguridad**: nunca hacer DELETE sin WHERE. Si la query de limpieza no tiene una condición que garantice borrar solo datos de test, no ejecutarla.

## PATRÓN VALIDACIÓN POST-ACCIÓN

Para confirmar que una acción de API persistió en DB:

```js
Then('la carátula cambió a estado firmada en la base de datos', function () {
  const caratulaNumero = this.caratulasIds[0]; // viene de step anterior
  
  const sql = `
    SELECT EstadoId 
    FROM OneClearing_Entregas.Caratula.Caratula 
    WHERE CaratulaNumero = ${caratulaNumero}
  `;
  
  return cy.task('queryOC', sql).then((result) => {
    expect(result).to.have.length(1);
    expect(result[0].EstadoId).to.eq(2); // 2 = Firmada
  });
});
```

## PATRÓN QUERY PARAMETRIZADA

Nunca concatenar inputs del usuario directamente en SQL. Usar formato de parámetro:

```js
// ❌ INCORRECTO — SQL injection posible
const sql = `SELECT * FROM ... WHERE Id = ${userInput}`;

// ✅ CORRECTO — validar el tipo antes de interpolar
const id = parseInt(userInput, 10);
if (isNaN(id)) throw new Error('ID inválido');
const sql = `SELECT * FROM OneClearing_Entregas.Caratula.Caratula WHERE CaratulaId = ${id}`;
```

## ESTRUCTURA DE ARCHIVOS SUGERIDA

```
cypress/e2e/
├── features/db/
│   ├── acsa/        → inyectar_manual.feature (ya existe)
│   └── caratulas/   → db_caratula.feature (ya existe)
└── step_definitions/db/
    ├── acsa/        → db_acsa_steps.js (ya existe)
    ├── caratulas/   → db_caratula_steps.js (ya existe)
    └── common/      → db_setup_steps.js  ← NUEVO si hace falta
```

## ADVERTENCIAS AUTOMÁTICAS

- ⚠️ **Requiere VPN activa** — las IPs de MSSQL son internas (192.168.139.x y 192.168.99.x). Verificar `ip addr show tun0` antes de correr.
- ⚠️ **No hay rollback automático** — si el test falla a mitad del setup, los datos pueden quedar inconsistentes. Diseñar el teardown para que funcione aunque el test falle.
- ⚠️ **Ambiente de datos** — en `uat.js` las URLs apuntan a dev (bug conocido del proyecto). Confirmar el ambiente antes de correr tests que modifiquen DB en UAT.
