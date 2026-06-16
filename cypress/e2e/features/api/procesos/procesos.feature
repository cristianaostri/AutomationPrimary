@api @backend
Feature: Procesos — estado y subprocesos del sistema

  @api @regression @backend
  Scenario: Obtener estado del proceso de casamiento
    Given que tengo acceso a la API de OneClearing
    When consulto el estado del proceso de casamiento
    Then la respuesta debe indicar si el proceso terminó o está en curso

  @api @regression @backend
  Scenario: Obtener subprocesos del tipo casamiento
    Given que tengo acceso a la API de OneClearing
    When solicito los subprocesos del tipo de proceso casamiento
    Then cada subproceso debe tener tipoSubprocesoID y orden
