# 🧪 Pruebas Funcionales Automatizadas (End-to-End)

Esta carpeta contiene la validación funcional E2E (End-to-End) del **Sistema de Becas Universitarias**, demostrando el flujo completo del negocio mediante Selenium (UI) y validaciones de contrato de API (simulación tipo SoapUI).

## 🚀 Flujo End-to-End Validado

El script automatizado (`ui_automation_demo.js`) ejecuta la siguiente historia de usuario de principio a fin de forma secuencial:

1. **[CASO 01] Login Admin y Vista de Becarios**
   - El administrador ingresa al sistema y visualiza el listado de expedientes generados por el motor académico.
2. **[CASO 02] Estudiantes (Sin Beca vs Con Beca)**
   - Validación de roles. Un estudiante sin beca recibe la alerta de rechazo. Un estudiante con beca entra a su dashboard.
3. **[CASO 03] Subida de Documento y Verificación**
   - El estudiante sube su Certificado Bancario en PDF. El administrador verifica en tiempo real que el documento está en estado "Pendiente de Revisión".
4. **[CASO 04] Aprobación y Desembolso (Saga Pattern)**
   - El administrador aprueba el documento y ejecuta el desembolso institucional a través de la pasarela de pagos simulada.
5. **[CASO 05] Descarga de Comprobante Oficial**
   - El estudiante beneficiario vuelve a ingresar, verifica que su beca ha sido depositada y descarga el comprobante en formato PDF.

## 📁 Estructura de Evidencias

Dentro de cada carpeta de caso (ej: `caso_01_admin_y_vista_becarios`), encontrarás una subcarpeta `/capturas/` que contiene:
- **Capturas `[SELENIUM]`**: Fotos reales del Frontend (React/Next.js) tomadas con Puppeteer.
- **Capturas `[SOAPUI]`**: Evidencia técnica de los llamados a las APIs (Microservicios) en el Backend.

---
**✅ Script de Ejecución**: `\tests\functional\run_selenium_ui_demo.ps1`
