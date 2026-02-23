Feature: Validación de Base de Datos - OneClearing

  Scenario: Consultar registros en la tabla Caratula
    Given que el sistema está conectado a la base de datos del ambiente elegido
    When ejecuto una consulta para obtener las últimas 5 carátulas
    Then la respuesta debería contener registros válidos
    And muestro la carátulaNumero y la Fecha de la primera carátula en el log