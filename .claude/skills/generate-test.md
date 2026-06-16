Creá una skill maestra en .claude/skills/generate-test.md que sepa generar tests completos de Cypress en Gherkin según el tipo de prueba.

## ANÁLISIS DE CONTEXTO
Antes de generar cualquier test, identificar qué tipo es:
- API pura — solo llamadas HTTP, validar status y response body
- Swagger — leer la definición del endpoint para saber qué campos valida
- DB — incluir validación de datos en base de datos después de la acción
- Frontend — incluir interacciones UI con cy.get, cy.click, cy.type
- Combinado — cualquier mezcla de los anteriores

## FIXTURES
- Si el test necesita un body (POST, PUT, PATCH), crear automáticamente el fixture en cypress/fixtures/[modulo]/[nombre-endpoint].json
- Nunca hardcodear datos en el test ni en los steps
- Antes de crear un fixture, verificar si ya existe uno para ese módulo y reutilizarlo o extenderlo

## MÓDULOS REUTILIZABLES
- Organizar steps por módulo (usuarios, pagos, productos, etc)
- Si un step ya existe en otro módulo, referenciarlo, nunca duplicarlo
- Antes de crear un step nuevo, leer todos los archivos en cypress/support/step_definitions/ y verificar si ya existe algo equivalente
- Antes de crear un .feature nuevo, verificar si ya existe uno para ese módulo y agregar el scenario ahí

## FUNCIONES COMPARTIDAS
- Si hay lógica repetida entre módulos (auth, headers, conexión DB), extraerla a cypress/support/commands.js o a un helper dedicado
- El token siempre inline dentro del step, nunca a nivel módulo
- Usar function() en lugar de arrow function cuando el step use this.alias
- Usar return cuando el step encadene múltiples tasks de Cypress

## FLUJO ENCADENADO
- Soportar escenarios donde el output de un test es el input del siguiente
- Ejemplo: POST crea recurso → GET verifica que existe → PUT lo modifica → DELETE lo elimina
- Usar cy.alias para pasar datos entre steps del mismo flujo
- Documentar en el .feature con comentarios qué datos se encadenan entre scenarios

## VALIDACIONES SIEMPRE PRESENTES
Según el tipo de test, incluir siempre:
- API: status code + structure del response body con fallbacks defensivos (items || data || [])
- DB: query que confirme que el dato quedó persistido correctamente, con path DB.Schema.Table
- Frontend: assertion de que el elemento aparece en pantalla después de la acción
- Combinado: todas las validaciones que apliquen

## TAGS
Usar los tags reales del proyecto:
- @smoke — tests críticos de humo
- @regression — suite completa de regresión
- @db — tests que necesitan conexión a base de datos (advertir que requiere VPN activa)
- @api — tests de API pura
- @wip — en desarrollo, no incluir en CI
- @frontend — tests de interfaz

## CONVENCIONES DEL PROYECTO
Seguir estrictamente lo definido en CLAUDE.md:
- Token inline dentro de cada step, nunca a nivel módulo
- function() para steps que usen this.alias
- Arrow function para el resto
- Fallbacks defensivos en response body: items || data || []
- Path de DB siempre como DB.Schema.Table
- No reusar conexiones de DB entre steps

## ANTES DE CREAR CUALQUIER ARCHIVO
1. Leer la estructura real del proyecto
2. Verificar si el módulo ya existe
3. Verificar si los steps ya existen
4. Verificar si el fixture ya existe
5. Solo crear lo que no existe, extender lo que ya está

## ADVERTENCIAS AUTOMÁTICAS
- Si el test usa @db → advertir que requiere VPN activa (tun0)
- Si el test usa endpoints internos → advertir que requiere VPN activa
- Si se crea un step nuevo → indicar en qué archivo se agregó
- Si se crea un fixture nuevo → indicar el path completo

Basate en el CLAUDE.md real del proyecto y en los patrones reales encontrados en el código.