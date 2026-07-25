# Caso 03: Estudiante Sube Documento y Admin Verifica

## 🎯 Objetivo de la Prueba
Probar el módulo de carga de archivos (AWS S3 / Document Service). El estudiante debe poder adjuntar un documento PDF real, y posteriormente, el sistema debe reflejar ese cambio de estado para que el Administrador vea el expediente como "Pendiente de Revisión" (`VALIDATING_DOC`).

## 📸 Evidencias Generadas (Directorio `/capturas/`)

### Evidencias de Interfaz de Usuario (Selenium)
* `01_modal_subida.png`: El estudiante abre el modal interactivo para la carga de su Certificado Bancario.
* `02_pdf_seleccionado.png`: El archivo PDF se adjunta en el formulario HTML.
* `03_pdf_subido.png`: Confirmación en el UI del estudiante de que el documento se cargó exitosamente y se encuentra en revisión.
* `04_admin_ve_documento_pendiente.png`: El administrador entra a su panel y visualiza el expediente del estudiante en estado de revisión de documento.

### Evidencias de API / Contratos (SoapUI)
* `05_soapui_upload_doc.png`: Request/Response `HTTP 201 Created` al servicio `/documents/upload` pasando el `multipart/form-data`.
* `06_soapui_admin_get_docs.png`: Llamado del panel de administrador que consulta y recupera los documentos en estado `WAITING`.
