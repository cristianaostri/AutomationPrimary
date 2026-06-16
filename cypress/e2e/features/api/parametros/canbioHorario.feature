@api
Feature: Cambio de parámetros: horario

   Scenario: Cambio dinámico para casamiento
     Given que tengo acceso a la api de OneClearing
     When solicito el cambio de horario para "casar"
     Then la API debe responder exitosamente

  # Scenario: Cambio específico para oferta
  #  Given que tengo acceso a la api de OneClearing
  #  When solicito el cambio de horario para "ofertar" con el valor "20:00"
  #  Then la API debe responder exitosamente