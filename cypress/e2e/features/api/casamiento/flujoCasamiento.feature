@flujocasamiento
Feature: Flujo completo — Parametros, Crear OE, Casar y Finalizar

  # Ejecutar con:
  # npx cypress run --browser chrome --env CYPRESS_ENV=qa,TAGS="@flujocasamiento"
  #
  # Para cambiar tipo: comentá Futuro y descomentá Disponible en el Examples

  @flujocasamiento @api
  Scenario Outline: Flujo completo con tipo <tipoContrato>
    # ── 1. Leer hora actual del parámetro 7 ───────────────────────────────────
    Given que tengo acceso a la API de OneClearing
    When  obtengo el valor actual del parámetro de hora de corte

    # ── 2. Setear hora MAYOR a la actual (para permitir crear OE) ─────────────
    And   actualizo el parámetro de hora de corte a una hora mayor

    # ── 3. Crear OE ────────────────────────────────────────────────────────────
    When  busco una operación disponible de tipo "<tipoContrato>"
    And   preparo el payload de OE con esa operación
    And   envío el POST para crear la OE
    Then  la OE fue creada exitosamente con un número de oferta

    # ── 4. Setear hora MENOR a la actual (para permitir iniciar casamiento) ────
    When  actualizo el parámetro de hora de corte a una hora menor

    # ── 5. Casamiento ──────────────────────────────────────────────────────────
    When  inicio el proceso de casamiento
    Then  la respuesta de inicio de casamiento debe ser exitosa
    When  ejecuto el proceso de casamiento con estado actual 8
    Then  el proceso de casamiento fue ejecutado correctamente

    # ── 6. Verificar y finalizar ───────────────────────────────────────────────
    When  verifico que todas las carátulas están en estado casado
    And   finalizo el proceso de casamiento con estado actual 7
    Then  el proceso de casamiento fue finalizado correctamente

    Examples:
      | tipoContrato |
      | Futuro       |
      # | Disponible |

