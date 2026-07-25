# Caso 01: Login Administrador y Vista de Becarios

## 🎯 Objetivo de la Prueba
Validar que un usuario con el rol `ADMIN` puede autenticarse exitosamente en la plataforma, obteniendo un token JWT válido (Backend) y accediendo al Panel de Control (Frontend). Además, verificar que el Administrador puede listar y buscar a los estudiantes procesados por el motor académico.

## 📸 Evidencias Generadas (Directorio `/capturas/`)

### Evidencias de Interfaz de Usuario (Selenium)
* `01_login_admin.png`: Pantalla de inicio de sesión con credenciales de administrador.
* `02_admin_dashboard_expedientes.png`: Vista general del panel de administración con los expedientes de becas cargados.
* `03_admin_busca_estudiante_2.png`: El administrador utiliza el buscador para filtrar específicamente al expediente de un estudiante (ej. `student_2`).

### Evidencias de API / Contratos (SoapUI)
* `04_soapui_admin_login.png`: Request/Response exitoso (`HTTP 201 Created`) del servicio de autenticación (`/auth/login`).
* `05_soapui_fetch_rankings.png`: Request/Response exitoso (`HTTP 200 OK`) hacia el servicio de consultas académicas (`/v1/queries/academic/rankings`) para popular la tabla de becarios.
