@api
Feature: Pronta Aplicación — listado, contratos y clientes

  @api @smoke
  Scenario: Listar prontas aplicaciones
    Given que tengo acceso a la API de OneClearing
    When solicito el listado de prontas aplicaciones
    Then la respuesta de pronta aplicación debe tener estructura paginada

  @api @smoke
  Scenario: Obtener contratos activos para pronta aplicación
    Given que tengo acceso a la API de OneClearing
    When solicito los contratos activos para pronta aplicación
    Then cada contrato activo debe tener contratoId y descripcion del contrato

  @api @regression
  Scenario: Obtener clientes para pronta aplicación
    Given que tengo acceso a la API de OneClearing
    When solicito las cuentas de clientes para pronta aplicación
    Then cada cliente de pronta aplicación debe tener clienteCodigo y clienteDescripcion
