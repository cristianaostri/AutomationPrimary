@api @smoke
Feature: Filtros — operadores lógicos disponibles

  @api @smoke @filtros
  Scenario: Obtener operadores lógicos para filtros
    Given que tengo acceso a la API de OneClearing
    When solicito los operadores lógicos disponibles
    Then cada operador lógico debe tener id y descripcion
