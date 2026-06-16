Revisá todos los archivos en cypress/e2e/step_definitions/**/*.js

PROBLEMA: Los Then genéricos usan cy.get("@alias") pero los aliases 
se resetean entre scenarios en Cypress. Falla cuando el alias del 
scenario anterior ya no existe.

SOLUCIÓN para cada archivo:
1. Cada Then debe usar el alias exacto de su propio When
   Ejemplo: When hace .as("estadosCaratulas") → Then usa cy.get("@estadosCaratulas")
2. Si hay Thens genéricos con lastAlias o variables → eliminarlos
3. Actualizar los .feature para usar los nombres de Then actualizados

NO tocar:
- step_definitions/api/caratulas/getCaratula.js
- step_definitions/api/caratulas/flujoCaratulacionSteps.js
- step_definitions/api/operaciones/oeSteps.js
- step_definitions/api/parametros/cambioHorarioSteps.js
- step_definitions/db/
- step_definitions/loginSteps.js
- step_definitions/common/loginSteps.js
