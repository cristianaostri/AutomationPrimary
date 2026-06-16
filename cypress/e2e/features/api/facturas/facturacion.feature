@api @facturacion
Feature: Facturación — carátulas, recibos y estados

  @api @smoke
  Scenario: Listar carátulas de facturación
    Given que tengo acceso a la API de OneClearing
    When solicito las carátulas disponibles para facturar
    Then la respuesta de facturación debe tener totalCount e items

  @api @regression
  Scenario: Obtener estados de recibos
    Given que tengo acceso a la API de OneClearing
    When solicito los estados de recibos
    Then cada estado de recibo debe tener id y descripcion

  @api @regression @backend
  Scenario: Consulta general de recibos sin filtros
    Given que tengo acceso a la API de OneClearing
    When realizo una consulta general de recibos sin filtros
    Then la respuesta de recibos debe tener estructura paginada

  @api @regression @backend
  Scenario: Recibos reservados pendientes de facturar
    Given que tengo acceso a la API de OneClearing
    When solicito los recibos reservados pendientes de facturar
    Then la respuesta debe tener totales y lista de recibos reservados

  @api @regression
  Scenario: Estado del servicio LPG en AFIP
    Given que tengo acceso a la API de OneClearing
    When solicito el estado del servicio LPG en AFIP
    Then la respuesta debe incluir code y serviceName del servicio

  @api @regression @backend
  Scenario: Recibos de una carátula específica
    Given que obtengo una carátula existente del listado
    When solicito los recibos de esa carátula
    Then la respuesta de recibos por carátula debe tener totalKilos e items
