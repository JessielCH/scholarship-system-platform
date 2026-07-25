Feature: Caso 02 - Proceso de Aprobación, Pago Saga y Notificaciones

  Como auditor de QA financiero
  Quiero validar el comportamiento transaccional del Patrón Saga
  Para garantizar la resiliencia en los pagos de becas universitarias

  Scenario: Camino de Éxito - Pago procesado satisfactoriamente (Saga Completed)
    Given el orquestador Saga recibe la orden de desembolso
    When el servicio de pagos confirma la transacción exitosa
    Then la transacción Saga finaliza como PAYMENT_COMPLETED
    And Selenium captura la evidencia gráfica en "01_c_exito_pago_procesado.png" para el Caso 02

  Scenario: Camino Alterno - Enrutamiento automático por pasarela secundaria
    Given la pasarela de pagos principal sufre latencia
    When el circuito enruta el cobro al canal secundario (Corresponsal)
    Then la transacción finaliza usando la ruta SECONDARY_ROUTER
    And Selenium captura la evidencia gráfica en "02_c_alterno_pasarela_secundaria.png" para el Caso 02

  Scenario: Excepciones - Rollback transaccional por fallo bancario
    Given la cuenta bancaria del estudiante es reportada inactiva
    When el banco rechaza la transacción con un error 500
    Then el Saga ejecuta una compensación y cambia el estado a PAYMENT_FAILED
    And Selenium captura la evidencia gráfica en "03_c_excepcion_rollback_saga_500.png" para el Caso 02
