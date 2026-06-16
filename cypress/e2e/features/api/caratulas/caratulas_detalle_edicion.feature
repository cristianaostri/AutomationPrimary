@api @caratulas
Feature: Carátulas — endpoints de detalle, edición y anulación

  # ── GET /api/v1/Caratulas/{numero} ─────────────────────────────────────────

  @api @regression @backend
  Scenario: Obtener detalle de una carátula por número
    Given que obtengo una carátula existente del listado
    When solicito el detalle de esa carátula por número
    Then la carátula debe tener los campos obligatorios del contrato

  @api @regression
  Scenario: Obtener carátula con número inexistente devuelve error
    Given que tengo acceso a la API de OneClearing
    When solicito el detalle de la carátula número 999999
    Then la respuesta debe tener un status de error

  # ── GET /api/v1/Caratulas/GetEstadoCaratulas ────────────────────────────────

  @api @smoke
  Scenario: Obtener listado de estados de carátulas
    Given que tengo acceso a la API de OneClearing
    When solicito el listado de estados de carátulas
    Then el listado de estados debe contener al menos un elemento con id y descripción

  # ── GET /api/v1/Caratulas/consultageneral ──────────────────────────────────

  @api @regression @backend
  Scenario: Consulta general de carátulas sin filtros
    Given que tengo acceso a la API de OneClearing
    When realizo una consulta general de carátulas sin filtros
    Then la respuesta debe tener estructura de página con items, pageIndex y totalCount

  @api @regression
  Scenario: Consulta general de carátulas filtrando por estado
    Given que tengo acceso a la API de OneClearing
    When realizo una consulta general de carátulas filtrando por estadoId 1
    Then todas las carátulas del resultado deben tener estadoCaratulaID igual a 1

  # ── PUT /api/v1/Caratulas ───────────────────────────────────────────────────

  @api @regression
  Scenario: Editar información básica de una carátula existente
    Given que obtengo una carátula existente del listado
    When edito la carátula con datos válidos del fixture
    Then la respuesta debe ser un booleano verdadero

  @api @regression
  Scenario: Editar carátula con caratulaNumero inexistente devuelve error
    Given que tengo acceso a la API de OneClearing
    When edito la carátula número 999999 con datos válidos
    Then la respuesta debe tener un status de error

  # ── POST /api/v1/Caratulas/solicitarAnulacion ──────────────────────────────

  @api @regression
  Scenario: Solicitar anulación de una carátula con motivo
    Given que obtengo una carátula existente del listado
    When solicito la anulación de esa carátula con un motivo
    Then la respuesta de solicitud de anulación debe ser exitosa

  # ── GET /api/v1/Caratulas/solicitudAnulacion ───────────────────────────────

  @api @regression
  Scenario: Obtener detalle de solicitud de anulación
    Given que tengo acceso a la API de OneClearing
    When consulto la solicitud de anulación de la carátula número 1
    Then la respuesta debe tener status 200 o indicar que no hay solicitud

  # ── GET /api/v1/Caratulas/AjustesSolicitados ──────────────────────────────

  @api @regression @backend
  Scenario: Obtener carátulas con ajustes solicitados
    Given que tengo acceso a la API de OneClearing
    When solicito el listado de carátulas con ajustes solicitados
    Then el listado puede estar vacío o contener carátulas con caratulaNumero
