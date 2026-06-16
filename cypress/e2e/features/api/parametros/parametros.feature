@api
Feature: Parámetros — lectura y validación de configuración del sistema

  @api @smoke
  Scenario: Listar todos los parámetros del sistema
    Given que tengo acceso a la API de OneClearing
    When solicito el listado de parámetros
    Then cada parámetro debe tener parametroId, parametroDescripcion y valor

  @api @regression
  Scenario: Listar módulos de parámetros
    Given que tengo acceso a la API de OneClearing
    When solicito el listado de módulos de parámetros
    Then cada módulo debe tener id y descripcion

  @api @regression
  Scenario: Listar categorías de parámetros
    Given que tengo acceso a la API de OneClearing
    When solicito las categorías de parámetros
    Then cada categoría debe tener id y descripcion

  @api @smoke
  Scenario: Obtener fecha de negocio hoy
    Given que tengo acceso a la API de OneClearing
    When solicito la fecha de negocio de hoy
    Then la respuesta debe incluir si la fecha de negocio es hoy

  @api @regression
  Scenario: Obtener contadores de novedades generales
    Given que tengo acceso a la API de OneClearing
    When solicito los contadores de novedades del módulo general
    Then los contadores deben incluir caratulasPendientesDeFirmaCount
