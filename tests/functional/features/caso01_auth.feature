Feature: Caso 01 - Autenticación y Seguridad (Identity Service)

  Como auditor de QA
  Quiero validar el sistema de autenticación JWT y los límites de seguridad
  Para asegurar que la plataforma universitaria cumple con la normativa de seguridad

  Scenario: Camino de Éxito - Login válido con credenciales legítimas
    Given el endpoint del API Gateway está disponible
    When envío una petición de login con el usuario "student@uce.edu.ec" y clave "password123"
    Then el servidor responde con 201 Created y retorna un Token JWT
    And Selenium captura la evidencia gráfica en "01_c_exito_login_jwt.png" para el Caso 01

  Scenario: Camino Alterno - Refresh Token regeneración silenciosa
    Given poseo un refresh token válido de sesión
    When solicito la regeneración del token al endpoint refresh
    Then el servidor devuelve un nuevo token
    And Selenium captura la evidencia gráfica en "02_c_alterno_refresh_token.png" para el Caso 01

  Scenario: Excepción Controlada - Bloqueo por Fuerza Bruta (Rate Limit 429) y Clave Errónea (401)
    Given intento ingresar con una clave incorrecta generando un error 401
    When simulo una ráfaga masiva de logins desde la misma IP
    Then el servidor bloquea el acceso devolviendo 429 Too Many Requests
    And Selenium captura la evidencia gráfica en "03_c_excepcion_rate_limit_429.png" para el Caso 01
