@api @operaciones
Feature: Ofertas de Entrega — listado, detalle y catálogos

  # ── GET /api/v1/Ofertas ─────────────────────────────────────────────────────

  @api @smoke
  Scenario: Listar ofertas de entrega sin filtros
    Given que tengo acceso a la API de OneClearing
    When solicito el listado de ofertas de entrega
    Then la respuesta de ofertas debe tener estructura paginada con items

  @api @regression @backend
  Scenario: Listar ofertas filtrando por estado pendiente
    Given que tengo acceso a la API de OneClearing
    When solicito las ofertas filtrando por estadoOfertaID 1
    Then todas las ofertas deben tener ofertaNumero y estadoOfertaId

  # ── GET /api/v1/Ofertas/{numero} ────────────────────────────────────────────

  @api @regression @backend
  Scenario: Obtener detalle de una oferta por número
    Given que obtengo una oferta existente del listado
    When solicito el detalle de esa oferta por número
    Then la oferta debe tener los campos obligatorios del schema

  # ── GET /api/v1/Ofertas/GetMedioTransporte ──────────────────────────────────

  @api @smoke
  Scenario: Obtener listado de medios de transporte
    Given que tengo acceso a la API de OneClearing
    When solicito los medios de transporte disponibles
    Then cada medio de transporte debe tener id y descripcion

  # ── GET /api/v1/Ofertas/GetTipoEntregador ───────────────────────────────────

  @api @smoke
  Scenario: Obtener listado de tipos de entregador
    Given que tengo acceso a la API de OneClearing
    When solicito los tipos de entregador disponibles
    Then cada tipo de entregador debe tener id y descripcion

  # ── GET /api/v1/Ofertas/Cosechas ────────────────────────────────────────────

  @api @smoke
  Scenario: Obtener listado de cosechas disponibles
    Given que tengo acceso a la API de OneClearing
    When solicito las cosechas disponibles
    Then cada cosecha debe tener clave y valor
