Feature: Auditoría Integral de API Carátulas

  @api @regression @backend
  Scenario: Validación de Contrato, Performance y Veracidad de Datos
    Given que tengo acceso a la API de OneClearing
    When solicito el listado general de carátulas
    Then la respuesta debe tener un status 200
    And el tiempo de respuesta debe ser inferior a 800ms
    And no debe haber campos con valores vacíos en los registros
    And no debe haber caratulas en estadoId 4 y 5
    And cada carátula debe tener un caratulaNumero único  
 