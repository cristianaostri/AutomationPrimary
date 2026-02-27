@api @caratulas
Feature: Flujo completo de Carátulas

  Background: Autenticación exitosa
    # Este Given DEBE estar definido en el JS
    Given que me autentico por API

  Scenario: Firmar y carátular definitivamente carátulas pendientes
    When obtengo la lista de carátulas en estado pendiente de firma
    And realizo la firma masiva de las carátulas encontradas
    Then realizo la caratulación definitiva de las mismas