Feature: Inyección de Operaciones - ACSA

  Scenario: Crear operación manual en ACSA
    Given que tengo conexión a la base de datos ACSA en "192.168.99.62"
    When inyecto la operación con los siguientes datos:
      | sufijo     | AUTO        | 
      | ruedalID   | 1           |
      | ejecID     | 1           |
      | cant       | 8           |
      | contrID    | 74793       |
      | ctaCpraID  | 3876        |
      | precio     | 350         |
      | ctaVtaID   | 2953        |
      | usuario    | cris        |
