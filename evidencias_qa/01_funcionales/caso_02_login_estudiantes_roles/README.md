# Caso 02: Login Estudiantes y Roles (Sin Beca vs Con Beca)

## 🎯 Objetivo de la Prueba
Validar la correcta asignación de estados y permisos por parte del motor académico y socioeconómico a nivel de los usuarios con rol `STUDENT`. Se verifica qué ocurre cuando un estudiante NO resulta beneficiario y cuando SÍ resulta beneficiario de una beca.

## 📸 Evidencias Generadas (Directorio `/capturas/`)

### Evidencias de Interfaz de Usuario (Selenium)
* `01_dashboard_sin_beca.png`: El estudiante ingresa al portal y recibe una alerta informativa indicando que no aplica a la beca en este período (estado `NOT_BENEFICIARY`).
* `02_dashboard_con_beca.png`: Un estudiante beneficiario ingresa al portal y accede a su dashboard con el estado `WAITING`, indicando que debe proceder con el siguiente paso (Subir Certificado).

### Evidencias de API / Contratos (SoapUI)
* `03_soapui_estudiante_sin_beca.png`: Simulación de la respuesta de evaluación que retorna el estado `RECHAZADO` para el estudiante no elegible.
* `04_soapui_estudiante_con_beca.png`: Simulación de la respuesta de evaluación que retorna el estado `APROBADO` para el estudiante elegible.
