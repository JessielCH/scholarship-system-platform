# Caso 05: Estudiante Descarga Recibo de Desembolso

## 🎯 Objetivo de la Prueba
Asegurar que el estudiante beneficiario puede acceder a su recibo/comprobante oficial de pago en formato PDF una vez que el flujo del Patrón Saga ha finalizado con éxito, cerrando el ciclo End-to-End de la beca.

## 📸 Evidencias Generadas (Directorio `/capturas/`)

### Evidencias de Interfaz de Usuario (Selenium)
* `01_estudiante_ve_beca_desembolsada.png`: El estudiante se loguea y ve en su timeline que el proceso está completo y la beca fue depositada.
* `02_modal_recibo_estudiante.png`: El estudiante abre el modal que presenta los detalles del comprobante (Referencia, Monto, Cuenta).
* `03_recibo_descargado.png`: El sistema reacciona al evento de descarga del PDF finalizando el proceso.

### Evidencias de API / Contratos (SoapUI)
* `04_soapui_get_receipt.png`: Validación del API de recibos retornando los datos de la transacción en JSON.
* `05_soapui_download_pdf.png`: Simulación de la obtención de la metadata binaria o enlace del documento PDF del recibo.
