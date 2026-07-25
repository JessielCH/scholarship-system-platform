Feature: Caso 03 - Elegibilidad Socioeconómica

  Como auditor universitario
  Quiero comprobar el motor de reglas de elegibilidad socioeconómica
  Para asegurar que las becas se otorguen justamente a quienes las necesitan

  Scenario: Camino de Éxito - Estudiante califica para beca
    Given un estudiante con ingresos menores al umbral de salario básico
    When el motor procesa los datos socioeconómicos
    Then el sistema determina la elegibilidad en "APROBADO"
    And Selenium captura la evidencia gráfica en "01_c_exito_elegible.png" para el Caso 03

  Scenario: Camino Alterno - Estudiante no califica por exceso de ingresos
    Given un estudiante con ingresos muy superiores al umbral
    When el motor procesa los datos socioeconómicos de altos ingresos
    Then el sistema determina la elegibilidad en "RECHAZADO"
    And Selenium captura la evidencia gráfica en "02_c_alterno_rechazado.png" para el Caso 03

  Scenario: Excepción Controlada - Faltan datos en el formulario
    Given un estudiante con formulario socioeconómico incompleto
    When el motor intenta procesar la solicitud
    Then el servidor devuelve un error HTTP 400 Bad Request
    And Selenium captura la evidencia gráfica en "03_c_excepcion_400.png" para el Caso 03
