@api @operaciones
Feature: Crear Oferta de Entrega (OE) — Futuro y Disponible

  # Busca automáticamente una operación del tipo indicado y crea la OE
  # Tipos válidos: "Futuro" | "Disponible"

  @api @regression
  Scenario Outline: Crear OE buscando una operación de tipo <tipoContrato>
    Given que tengo acceso a la API de OneClearing
    When busco una operación disponible de tipo "<tipoContrato>"
    And preparo el payload de OE con esa operación
    When envío el POST para crear la OE
    Then la OE fue creada exitosamente con un número de oferta

    Examples:
      | tipoContrato |
      | Futuro       |
      | Disponible   |

  @api @regression
  Scenario: Crear OE de Futuro con cantidad de toneladas personalizada
    Given que tengo acceso a la API de OneClearing
    When busco una operación disponible de tipo "Futuro"
    And preparo el payload de OE con esa operación y 100 toneladas
    When envío el POST para crear la OE
    Then la OE fue creada exitosamente con un número de oferta

  @api @regression
  Scenario: Crear OE de Disponible con cantidad de toneladas personalizada
    Given que tengo acceso a la API de OneClearing
    When busco una operación disponible de tipo "Disponible"
    And preparo el payload de OE con esa operación y 100 toneladas
    When envío el POST para crear la OE
    Then la OE fue creada exitosamente con un número de oferta

  @api @regression
  Scenario: Intentar crear OE sin operaciones retorna error de validación
    Given que tengo acceso a la API de OneClearing
    When envío el POST para crear la OE sin operaciones
    Then  la creación de OE debe retornar error de validación
