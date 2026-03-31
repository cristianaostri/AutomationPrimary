
@api @operaciones
Feature: Creación de Oferta de Entrega (OE) Flexible
  Como usuario de la API de OneClearing
  Quiero poder crear una OE usando datos manuales o automáticos

Scenario Outline: Creación de OE en modo <modo>
    Given que preparo los datos de la OE en modo "<modo>"
    When  envío la solicitud POST para crear la OE
    Then  la respuesta debe ser exitosa y retornar un ID

    Examples:
      | modo       | descripción                                  |
      # | manual     | Usa el JSON tal cual está en el fixture      |
      | automático | Busca la primera operación de venta en la API |