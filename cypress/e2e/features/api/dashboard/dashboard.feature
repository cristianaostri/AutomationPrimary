@api @smoke
Feature: Dashboard — información general de ofertas y carátulas

  @api @smoke
  Scenario: Dashboard principal devuelve estructura completa
    Given que tengo acceso a la API de OneClearing
    When solicito el dashboard principal
    Then el dashboard debe tener las secciones caratulado, presentado y pendiente

  @api @regression
  Scenario: Dashboard de volumen caratulado responde correctamente
    Given que tengo acceso a la API de OneClearing
    When solicito el volumen caratulado
    Then la respuesta de volumen debe tener fecha y contratos

  @api @regression
  Scenario: Compras y ventas abiertas mes en curso
    Given que tengo acceso a la API de OneClearing
    When solicito compras y ventas abiertas para el mes en curso
    Then la respuesta de compras y ventas abiertas debe tener estructura paginada
