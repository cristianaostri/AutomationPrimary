@api
Feature: SobreDigital — tipos de archivo y consulta

  @api @smoke
  Scenario: Obtener tipos de archivo del sobre digital
    Given que tengo acceso a la API de OneClearing
    When solicito los tipos de archivo del sobre digital
    Then cada tipo de archivo debe tener tipoArchivoId y archivoDescripcion

  @api @regression
  Scenario: Consultar archivos del sobre digital sin filtros
    Given que tengo acceso a la API de OneClearing
    When consulto los archivos del sobre digital sin filtros de fecha
    Then el resultado de sobre digital debe ser un array
