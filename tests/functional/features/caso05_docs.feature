Feature: Caso 05 - Subida de Documentos (Identity & Document Service)

  Como estudiante postulante
  Quiero subir mis documentos de respaldo (PDF, cédula) al sistema
  Para completar mi expediente de beca de forma digital

  Scenario: Camino de Éxito - Subida de archivo PDF correcto
    Given un archivo PDF válido menor a 5MB
    When el estudiante realiza el upload al endpoint de documentos
    Then el sistema retorna un 201 Created con la URL del archivo guardado
    And Selenium captura la evidencia gráfica en "01_c_exito_upload_pdf.png" para el Caso 05

  Scenario: Camino Alterno - Subida de imagen comprimida
    Given una imagen JPG válida menor a 5MB
    When el estudiante sube el archivo fotográfico
    Then el sistema lo acepta y genera un 201 Created
    And Selenium captura la evidencia gráfica en "02_c_alterno_upload_jpg.png" para el Caso 05

  Scenario: Excepción Controlada - Archivo demasiado grande (Payload Too Large)
    Given un archivo gigante mayor a 10MB
    When el estudiante intenta subirlo
    Then el sistema bloquea el upload devolviendo HTTP 413 Payload Too Large
    And Selenium captura la evidencia gráfica en "03_c_excepcion_archivo_pesado.png" para el Caso 05
