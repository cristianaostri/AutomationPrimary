@api @caratulas @firmarcaratula
Feature: Flujo completo de Carátulas

  Background: Autenticación exitosa
    Given que me autentico por API

  Scenario: Firmar y carátular definitivamente carátulas pendientes
    When obtengo la lista de carátulas en estado pendiente de firma
    And realizo la firma masiva de las carátulas encontradas
    Then realizo la caratulación definitiva de las mismas