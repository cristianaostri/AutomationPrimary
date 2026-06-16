@api @backend
Feature: Sistema — operaciones administrativas

  @api @regression @backend
  Scenario: Limpiar caché del sistema responde exitosamente
    Given que tengo acceso a la API de OneClearing
    When solicito la limpieza de caché del sistema
    Then la respuesta de sistema debe ser exitosa
