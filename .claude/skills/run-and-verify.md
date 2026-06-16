# Skill: run-and-verify

Ejecutá un test o suite de Cypress, interpretá el output completo y determiná si el fallo es de lógica de test, de infraestructura o de código.

## ANTES DE EJECUTAR

Verificar siempre:
1. ¿La VPN está activa? Correr `ip addr show tun0` — si no existe, advertir y detener.
2. ¿El ambiente es correcto? Si no se especificó, usar `qa` por defecto.
3. ¿Existe el archivo `.feature` o el tag solicitado?

## COMANDOS DE EJECUCIÓN

Un feature específico:
```bash
npx cypress run --browser chrome --env CYPRESS_ENV=qa \
  --spec "cypress/e2e/features/{modulo}/{archivo}.feature"
```

Por tag:
```bash
npx cypress run --browser chrome --env CYPRESS_ENV=qa,TAGS="@{tag}"
```

Suite completa con reporte:
```bash
npm run test:master
```

## INTERPRETACIÓN DEL OUTPUT

Leer la salida de la terminal y clasificar cada fallo:

### Fallo de infraestructura (no es bug del test)
Señales:
- `Error: connect ECONNREFUSED` → VPN caída o IP incorrecta
- `cy.session() requires the validate option` → problema de configuración de session
- `TypeError: Cannot read properties of undefined` en un step de login → token no sincronizado, revisar que `cy.loginViaApi()` fue invocado en el hook `Before({ tags: "@api" })`
- Timeout en `cy.task('queryOC')` o `cy.task('queryACSA')` → VPN caída o servidor MSSQL inaccesible

Acción: no modificar el test. Informar el problema de infra y el paso para resolverlo.

### Fallo de lógica de test (sí es bug del test)
Señales:
- `AssertionError: expected X to equal Y` → el test tiene la assertion incorrecta o el dato cambió
- `La respuesta no contiene un array` → el response body cambió de shape, actualizar el fallback
- `No se encontraron carátulas pendientes` → precondición de datos no cumplida, agregar setup
- `expected 200 to be one of [200,204]` → nuevo status code válido no contemplado

Acción: proponer el fix exacto con diff del paso fallido.

### Fallo de anti-pattern de código
Señales:
- `Cypress.env('accessToken')` retorna `undefined` en el primer step → token leído a nivel módulo en lugar de inline
- `this.alias` es `undefined` → step usa arrow function en lugar de `function()`
- Task retorna `undefined` → falta `return` al encadenar múltiples `cy.task()`

Acción: corregir el anti-pattern según las convenciones del CLAUDE.md.

## REPORTE DE RESULTADO

Después de cada ejecución responder con este formato:

```
RESULTADO: ✅ PASÓ / ❌ FALLÓ / ⚠️ FALLO DE INFRA

Tests ejecutados: N
Pasaron: N | Fallaron: N | Pendientes: N
Tiempo total: Xs

[Si falló] CAUSA: {descripción breve}
[Si falló] TIPO: lógica de test | infra | anti-pattern de código
[Si falló] FIX SUGERIDO:
  Archivo: cypress/e2e/step_definitions/{path}
  Cambio: {diff o descripción exacta}
```

## DESPUÉS DE EJECUTAR

- Si el test pasó y se generó reporte HTML: mencionar que se puede subir a Drive con el MCP Google Drive.
- Si fallaron múltiples tests: listarlos agrupados por tipo de fallo antes de proponer fixes.
- Nunca modificar hooks.js ni commands.js sin confirmación explícita — son archivos compartidos por todos los tests.
