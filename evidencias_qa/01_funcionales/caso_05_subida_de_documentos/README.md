# 🟡 Caso 05: Subida y Validación Documental en el Portal (Riesgo: Medio)

## 📌 ¿Qué vamos a hacer y qué hace esta prueba?
Este caso protege la integridad y veracidad del repositorio de evidencias digitales de los postulantes interaccionando con el frontal [student-portal](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/apps/student-portal) y el backend de archivos: [document-service](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/apps/document-service).

**¿Qué hace la prueba?** Certifica que los escaneos documentales obligatorios (Cédula y certificado bancario en PDF) se almacenen en el servidor sin corrupción binaria calculando su hash inmutable, verifica el control de versionado cuando un revisor solicita corregir un PDF ilegible y comprueba que los escudos antivirus rechacen ejecutables maliciosos o cargas desproporcionadas en MB.

## 🛣️ Detalle de las Rutas de Prueba Evaluadas

### 🟢 1. Camino de Éxito (Happy Path: Subida de Cédula PDF sin problemas)
* **Acción realizada:** En la interfaz de subida de ficheros del `student-portal`, el postulante selecciona y adjunta en formato `.pdf` ligero (ej. 800 KB) la copia nítida de su cédula de identidad al endpoint `/documents/upload`.
* **Comportamiento esperado:** El microservicio intercepta el *form-data*, examina los Magic Numbers del encabezado PDF de los bytes, computa el identificador HASH criptográfico sha-256 para inmutabilidad y lo escribe de forma segura. Contesta con código HTTP `201 Created` / `200 OK` devolviendo la ficha del recurso: `{"documentId": "uuid-...", "hash": "a9f87...", "status": "PENDING_VERIFICATION", "sizeBytes": 819200}`.

### 🔵 2. Camino Alterno (Reemplazo y Versionado de un Documento Observado por Ilegibilidad)
* **Acción realizada:** Un analista revisor calificó un PDF cargado semanas atrás como "Rechazado por Ilegible / Borroso". El postulante accede nuevamente a la pestaña del portal, presiona el botón "Reemplazar documento observado" y carga un nuevo escaneo en alta definición para el mismo ítem.
* **Comportamiento esperado:** El backend detecta la existencia de un fichero previo sobre la misma vacante de beca; en lugar de sobreescribir el disco borrando la auditoría, manda el fichero viejo a la tabla de **Archivo Histórico Inactico** de solo lectura y consolida la nueva carga elevando su control de versiones. Responde `200 OK` explicitando la correlación: `{"documentId": "uuid-new...", "version": 2, "previousVersionStatus": "ARCHIVED_FOR_AUDIT", "status": "RE-SUBMITTED_FOR_REVIEW"}`.

### 🔴 3. Excepciones / Errores Controlados (Malware y Archivos Descomunales)
* **Excepción A (Intento de inyección de script malicioso o extensión no autorizada):** El alumno o un bot enmascara un ejecutable (por ejemplo un archivo `.exe`, `.sh` o un payload `.apk`) rebautizándole de nombre y extensión engañosos a `documento.pdf.exe` y lo manda a la API. El validador de flujo binario del servicio intercepta el formato ilegal y aborta la petición devolviendo un mensaje rojo tajante con el código HTTP `415 Unsupported Media Type` (`{"error": "Invalid file format. Only PDF binaries under 5MB are permitted."}`).
* **Excepción B (Ataque por Desbordamiento de Tamaño / Archivo Gigante):** Se trata de subir un fichero desmedido de 45 MB (> 5 MB, el techo máximo estipulado). El servidor interrumpe la carga de golpe antes de copar la memoria y retorna código HTTP `413 Payload Too Large`.

---

## 📸 Instrucciones de Capturas y Almacenamiento en `/capturas/`

Guarda dentro de la subcarpeta `capturas/` de este caso las 3 imágenes oficiales para respaldar el test documental con estas designaciones:

1. **`01_c_exito_carga_pdf.png`** ➔ Captura del navegador en la pantalla web (o en Postman) donde se aprecie el mensaje en verde indicando que el PDF de cédula se subió exitosamente devolviendo su código hash o estado `PENDING_VERIFICATION`.
2. **`02_c_alterno_reemplazo_observado.png`** ➔ Captura de la consola o respuesta HTTP mostrando que se re-subió y actualizó con éxito la versión de un documento previamente rechazado por ilegible (ej. mostrando `version: 2`).
3. **`03_c_excepcion_extension_maliciosa_415.png`** ➔ Captura explícita demostrando cómo el servidor rechazó con seguridad los intentos de adjuntar archivos prohibidos devoviendo error `415 Unsupported Media Type` o excediendo el límite de megabytes al retornar error `413 Payload Too Large`.
