@api
Feature: Personas — agentes, clientes y cuentas de entrega

  @api @smoke
  Scenario: Obtener listado de agentes agro
    Given que tengo acceso a la API de OneClearing
    When solicito el listado de agentes agro
    Then cada agente debe tener codigo, descripcion y cuitCuil

  @api @regression
  Scenario: Obtener agentes de entrega
    Given que tengo acceso a la API de OneClearing
    When solicito el listado de agentes de entrega
    Then el listado de agentes de entrega puede ser un array vacío

  @api @regression
  Scenario: Obtener todos los agentes de entrega
    Given que tengo acceso a la API de OneClearing
    When solicito el listado completo de todos los agentes de entrega
    Then el listado de agentes de entrega puede ser un array vacío

  @api @regression
  Scenario: Obtener lista para impersonación
    Given que tengo acceso a la API de OneClearing
    When solicito la lista de compañías para impersonación
    Then cada compañía de impersonación debe tener companyId y companyName

  @api @regression
  Scenario: Obtener clientes de un agente
    Given que tengo acceso a la API de OneClearing
    And obtengo el código de un agente existente
    When solicito los clientes de ese agente
    Then cada cliente debe tener codigo y descripcion

  @api @regression
  Scenario: Obtener cuentas de entrega
    Given que tengo acceso a la API de OneClearing
    When solicito las cuentas de entrega disponibles
    Then las cuentas de entrega pueden ser un array vacío
