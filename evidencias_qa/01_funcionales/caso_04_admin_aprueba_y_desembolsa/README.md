# Caso 04: Administrador Aprueba y Ejecuta Desembolso

## 🎯 Objetivo de la Prueba
Validar la lógica de negocio central del sistema de becas: el Coordinador o Administrador revisa el documento cargado, lo aprueba (`APPROVED`) y posteriormente ejecuta el proceso de pago (`DISBURSED`) utilizando el Patrón Saga y mensajería encolada para garantizar la consistencia transaccional.

## 📸 Evidencias Generadas (Directorio `/capturas/`)

### Evidencias de Interfaz de Usuario (Selenium)
* `01_admin_aprueba_doc.png`: El administrador da clic en el botón de Aprobar para el documento bancario revisado.
* `02_modal_pago_stripe.png`: Se despliega el modal transaccional de desembolso para confirmar la operación financiera.
* `03_recibo_generado_admin.png`: Confirmación de que el pago fue procesado con éxito y el recibo fue emitido y firmado por el coordinador.

### Evidencias de API / Contratos (SoapUI)
* `04_soapui_aprobar_doc.png`: Petición `PUT` al servicio de documentos para cambiar el estado a `APPROVED`.
* `05_soapui_saga_payment.png`: Invocación del servicio orquestador `/saga/payment` que retorna `PAYMENT_COMPLETED`, confirmando la transacción financiera.
