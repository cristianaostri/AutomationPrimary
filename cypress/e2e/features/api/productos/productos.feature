@api @smoke
Feature: Productos — contratos activos y validación de ajuste

  @api @smoke
  Scenario: Listar contratos activos del sistema
    Given que tengo acceso a la API de OneClearing
    When solicito los contratos activos
    Then cada contrato activo debe tener contratoId y descripcion del contrato
