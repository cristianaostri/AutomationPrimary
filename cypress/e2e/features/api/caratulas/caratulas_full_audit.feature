Feature: Auditoría Integral de API Carátulas

  @api @regression @backend
  Scenario: Validación de Contrato, Performance y Veracidad de Datos
    Given que tengo acceso a la API de OneClearing
    When solicito el listado general de carátulas
    Then la respuesta debe tener un status 200
    And el tiempo de respuesta debe ser inferior a 800ms
    And no debe haber campos con valores vacíos en los registros
    And los datos de la API deben coincidir con la base de datos OneClearing