@api @backend
Feature: Log — consulta y ranking de logs desde Elasticsearch

  @api @regression @backend
  Scenario: Consulta de logs sin filtros devuelve estructura paginada
    Given que tengo acceso a la API de OneClearing
    When consulto los logs del sistema sin filtros
    Then la respuesta de logs debe tener estructura paginada con items de log

  @api @regression @backend
  Scenario: Consulta de logs filtrando por nivel Error
    Given que tengo acceso a la API de OneClearing
    When consulto los logs del sistema filtrando por nivel Error
    Then la respuesta de logs debe tener estructura paginada con items de log

  @api @regression @backend
  Scenario: Ranking de queries más utilizadas y lentas
    Given que tengo acceso a la API de OneClearing
    When solicito el ranking de queries del sistema
    Then el ranking debe tener consultasMasUtilizadas y consultasMasLargas
