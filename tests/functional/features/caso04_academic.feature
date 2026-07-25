Feature: Caso 04 - Malla y Promedio Académico

  Como evaluador académico
  Quiero que el sistema verifique el rendimiento académico del estudiante
  Para garantizar el cumplimiento del reglamento de becas universitarias

  Scenario: Camino de Éxito - Estudiante con promedio sobresaliente
    Given el estudiante posee un promedio ponderado mayor a 9.0
    When el motor académico procesa sus calificaciones
    Then el sistema emite el certificado de "EXCELENCIA_ACADEMICA" con 200 OK
    And Selenium captura la evidencia gráfica en "01_c_exito_promedio_alto.png" para el Caso 04

  Scenario: Camino Alterno - Estudiante con promedio regular
    Given el estudiante posee un promedio entre 7.0 y 8.9
    When el motor académico procesa sus calificaciones regulares
    Then el sistema emite el certificado "REGULAR" 
    And Selenium captura la evidencia gráfica en "02_c_alterno_promedio_regular.png" para el Caso 04

  Scenario: Excepción Controlada - Estudiante reprobado o bajo el límite
    Given el estudiante posee un promedio inferior a 7.0
    When el motor académico valida el reglamento
    Then el sistema arroja una alerta de incumplimiento académico
    And Selenium captura la evidencia gráfica en "03_c_excepcion_reprobado.png" para el Caso 04
