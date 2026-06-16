@api @casamiento
Feature: Casamiento — dashboard, reglas y asignación de operaciones

  @api @smoke
  Scenario: Dashboard de casamiento devuelve estructura completa
    Given que tengo acceso a la API de OneClearing
    When solicito el dashboard de casamiento
    Then el dashboard de casamiento debe tener fecha, estadoCasamiento y cards

  @api @regression
  Scenario: Obtener tipos de regla de casamiento
    Given que tengo acceso a la API de OneClearing
    When solicito los tipos de regla de casamiento
    Then cada tipo de regla debe tener tipoReglaCasamientoID y tipoReglaCasamientoDescripcion

  @api @regression @backend
  Scenario: Listar reglas de casamiento habilitadas
    Given que tengo acceso a la API de OneClearing
    When solicito las reglas de casamiento habilitadas
    Then el resultado debe ser un array de reglas de casamiento

  @api @regression @backend
  Scenario: Listar reglas de casamiento incluyendo deshabilitadas
    Given que tengo acceso a la API de OneClearing
    When solicito todas las reglas de casamiento incluyendo deshabilitadas
    Then el resultado debe ser un array de reglas de casamiento

  @api @regression
  Scenario: Convenidas con saldo insuficiente responde correctamente
    Given que tengo acceso a la API de OneClearing
    When solicito las convenidas con saldo insuficiente
    Then el resultado debe ser un array que puede estar vacío

  @api @regression
  Scenario: Obtener controles del proceso de casamiento
    Given que tengo acceso a la API de OneClearing
    When solicito los controles del proceso de casamiento
    Then cada control debe tener controlId y titulo
