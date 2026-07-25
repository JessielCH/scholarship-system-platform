# 📑 Plan Completo de Pruebas QA y Guía de Evidencias Paso a Paso

Este documento constituye el **Plan Maestro de Pruebas** de la plataforma **UCE Scholarship System Platform**. Aquí se definen los **5 Casos de Prueba Críticos**, detallando para cada uno su **Camino de Éxito**, **Caminos Alternos** y **Excepciones**. 

Además, se incluye el **Manual Operativo Herramienta por Herramienta** (Funcional, Rendimiento, Estático y Seguridad/Vulnerabilidades) con las instrucciones precisas para generar, tomar y archivar las **capturas de evidencia para cada ruta de cada caso**.

---

## 🗂️ Estructura de la Carpeta de Evidencias Requerida

Crea una carpeta llamada `evidencias_qa/` en la raíz de tu computadora (o dentro del repositorio, habiendo añadido `evidencias_qa/` al archivo [.gitignore](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/.gitignore)) con la siguiente organización por rubro, caso y camino:

```text
evidencias_qa/
 ├── 01_funcionales/                   <-- Selenium / Cucumber / Postman Newman
 │    ├── Caso01_Autenticacion/
 │    │    ├── 01_c_exito_login_jwt.png
 │    │    ├── 02_c_alterno_refresh_token.png
 │    │    └── 03_c_excepcion_rate_limit_429.png
 │    ├── Caso02_Pago_Saga_Notificaciones/
 │    │    ├── 01_c_exito_pago_procesado.png
 │    │    ├── 02_c_alterno_pasarela_secundaria.png
 │    │    └── 03_c_excepcion_rollback_saga_500.png
 │    ├── Caso03_Elegibilidad_Socioeconomica/
 │    │    ├── 01_c_exito_quintil_1_elegible.png
 │    │    ├── 02_c_alterno_equidad_territorial.png
 │    │    └── 03_c_excepcion_ingresos_excedidos_403.png
 │    ├── Caso04_Promedio_Academico/
 │    │    ├── 01_c_exito_promedio_85.png
 │    │    ├── 02_c_alterno_top_5_merito.png
 │    │    └── 03_c_excepcion_materia_arrastre_400.png
 │    └── Caso05_Subida_Documentario/
 │         ├── 01_c_exito_carga_pdf.png
 │         ├── 02_c_alterno_reemplazo_observado.png
 │         └── 03_c_excepcion_extension_maliciosa_415.png
 │
 ├── 02_rendimiento_k6/                <-- k6 & JMeter
 │    ├── reporte_dashboard_k6.html    (Reporte HTML Autogenerado)
 │    ├── 01_stress_login_alto_riesgo.png
 │    ├── 02_stress_pagos_saga.png
 │    └── 03_grafica_latencia_y_cuellos_de_botella.png
 │
 ├── 03_estaticas_sonarqube/           <-- SonarQube Community Edition
 │    ├── 01_overview_quality_gate.png (Aprobado/Fallido + Rating)
 │    ├── 02_coverage_porcentaje.png   (Cobertura de pruebas unitarias Jest/Vitest)
 │    ├── 03_deuda_tecnica_smells.png  (Horas de refactorización proyectadas)
 │    └── 04_seguridad_hotspots.png    (Revisión de librerías y código sensible)
 │
 └── 04_vulnerabilidades_owasp/        <-- OWASP ZAP (Zed Attack Proxy)
      ├── reporte_scan_owasp_zap.html  (Informe Oficial exportado por ZAP)
      ├── 01_grafico_criticidad_defectos.png (Alertas: High, Medium, Low)
      ├── 02_detalle_alerta_roja_sqli_o_jwt.png
      └── 03_evidencia_remediacion_headers.png
```

---

## 1️⃣ Plan de Pruebas: 5 Casos Completos (Priorizados por Riesgo)

A continuación, se describen los 5 casos requeridos por la norma de calidad para cubrir los microservicios de la plataforma:

### 🔴 Caso 01 (Riesgo Muy Alto): Autenticación de Estudiantes e Inicio de Sesión
* **Microservicios involucrados:** `identity-service` + Redis Rate Limiter + `api-gateway`.
* **Descripción:** Verifica el acceso al portal institucional garantizando seguridad inexpugnable ante ataques pasivos o activos.

| Ruta de Prueba | Escenario Técnico & Comportamiento | Respuesta / Resultado Experimento | Captura Requerida (Nombre y Contenido) |
| :--- | :--- | :--- | :--- |
| 🟢 **Camino de Éxito** | Estudiante ingresa su correo institucional (`student@uce.edu.ec`) y contraseña válida. El sistema valida el hash `bcryptjs` en Postgres y firma un Token JWT encriptado con tiempo de expiración de 1 hora. | Código HTTP `200 OK`. Retorna objeto con `token: "jwt..."` y redirección hacia `/dashboard`. | `01_c_exito_login_jwt.png`: Foto de Postman/Newman o Selenium mostrando el mensaje de 200 OK con el token devuelto. |
| 🔵 **Camino Alterno** | El usuario deja la ventana inactiva por 61 minutos y su Token JWT caduca. Al hacer click en otra pestaña, el frontend manda en silencio su *Refresh Token* al endpoint `/auth/refresh` sin sacarlo de su sesión visual. | Código HTTP `200 OK`. Retorna un nuevo JWT refrescado sin obligar a introducir la contraseña nuevamente. | `02_c_alterno_refresh_token.png`: Foto del log de red o Postman mostrando petición exitosa a `/auth/refresh` con nuevo token. |
| 🔴 **Excepción / Error** | 1) Intento con contraseña incorrecta (devuelve `401 Unauthorized`).<br>2) **Ataque de Fuerza Bruta:** Se envían >20 peticiones seguidas al login. Redis detecta ráfaga de ataques desde la misma IP y bloquea la solicitud de inmediato. | Código HTTP `429 Too Many Requests`. Mensaje de error de seguridad: *"Rate limit exceeded. Try again later."* | `03_c_excepcion_rate_limit_429.png`: Captura exacta del error `429` (¡este comportamiento está modelado en [login.js](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/tests/k6/login.js)!). |

---

### 🔴 Caso 02 (Riesgo Muy Alto): Aprobación de Beca, Emisión de Pago y Notificaciones
* **Microservicios involucrados:** `payment-service` + `workflow-saga` + `notification-hub` + RabbitMQ + Cassandra.
* **Descripción:** Controla que el pago monetario de la beca siga una transacción ACID por medio de patrón Saga y comunique en tiempo real al estudiante.

| Ruta de Prueba | Escenario Técnico & Comportamiento | Respuesta / Resultado Experimento | Captura Requerida (Nombre y Contenido) |
| :--- | :--- | :--- | :--- |
| 🟢 **Camino de Éxito** | El comité aprueba el beneficio por el `workflow-saga`. Se dispara orden al `payment-service` (pago bancario), se emite mensaje a RabbitMQ (`SPRING_RABBITMQ_USERNAME`), y el `notification-hub` registra el historial en Apache Cassandra y envía el correo/push de éxito. | Código HTTP `200 OK` (y estado Saga = `PAYMENT_COMPLETED`). Notificación archivada en base de datos. | `01_c_exito_pago_procesado.png`: Captura en Postman o BD mostrando la transacción en estado `PAYMENT_COMPLETED` (o `200 OK`). |
| 🔵 **Camino Alterno** | El banco principal de la universidad está en ventana de mantenimiento nocturno o no responde de inmediato. El sistema detecta latencia elevada e instruye un enrutamiento por red corresponsal interbancaria secundaria exitosa. | Código HTTP `200 OK` con metadata de enrutamiento alterno (`gateway_used: "SECONDARY_ROUTER"`). | `02_c_alterno_pasarela_secundaria.png`: Captura mostrando la respuesta exitosa transaccionando por el circuito de respaldo. |
| 🔴 **Excepción / Error** | La cuenta bancaria registrada por el estudiante se encuentra cerrada, embargada o con error en el dígito verificador al procesar el depósito. El banco retorna error severo al servicio. | **Activación del Rollback (Compensación de Saga):** El servicio revierte el estado de pago, marca `PAYMENT_FAILED` o `REJECTED`, emite una alerta a finanzas y responde error `502 Bad Gateway` / `500 Server Error` controlado. | `03_c_excepcion_rollback_saga_500.png`: Captura donde se demuestre el error de transferencia y cómo el Saga cambió a estado de rechazo `PAYMENT_FAILED`. |

---

### 🟠 Caso 03 (Riesgo Medio-Alto): Evaluación Socioeconómica y Equidad Territorial
* **Microservicios involucrados:** `socioeconomic-validator`.
* **Descripción:** Calcula y certifica si un postulante cumple el estándar de vulnerabilidad familiar y necesidad económica para recibir la beca.

| Ruta de Prueba | Escenario Técnico & Comportamiento | Respuesta / Resultado Experimento | Captura Requerida (Nombre y Contenido) |
| :--- | :--- | :--- | :--- |
| 🟢 **Camino de Éxito** | Se envía el JSON de la ficha socioeconómica evaluada donde los ingresos per cápita familiares sitúan al postulante en Quintil 1 o Quintil 2. El motor certifica de inmediato al estudiante. | Código HTTP `200 OK`. El payload JSON retorna `{"isEligible": true, "score": 92, "category": "HIGH_PRIORITY"}`. | `01_c_exito_quintil_1_elegible.png`: Captura en Postman o en el web portal donde sale el Check verde de *"Calificado Socioeconómicamente"*. |
| 🔵 **Camino Alterno** | El estudiante ostenta un Quintil 3 (ingreso en zona gris/límite de rechazo), pero su código postal corresponde a una **Comunidad Indígena o Parroquia Rural Prioritaria**. El sistema activa la regla de ponderación territorial afirmativa e igual le concede el puntaje aprobatorio. | Código HTTP `200 OK`. Retorna `{"isEligible": true, "equityBonus Applied": true, "category": "RURAL_EQUITY"}`. | `02_c_alterno_equidad_territorial.png`: Captura de la respuesta aprobatoria evidenciando el factor compensador por ruralidad/equidad. |
| 🔴 **Excepción / Error** | 1) El estudiante proviene de un hogar en Quintil 5 con ingresos que superan 5 veces el salario básico normado (retorna `{"isEligible": false}`, error `403 Forbidden`).<br>2) Se intenta enviar datos corruptos o valores numéricos negativos en ingresos de familia (error de validación de schema: `422 Unprocessable Entity`). | Código HTTP `403 Forbidden` (`{"error": "Income threshold exceeded for scholarship criteria"}`) o `422 Unprocessable Entity`. | `03_c_excepcion_ingresos_excedidos_403.png`: Captura del mensaje explícito del rechazo al exceder los límites fijados de ingresos o error de datos `422`. |

---

### 🟡 Caso 04 (Riesgo Medio): Verificación del Promedio y Malla Curricular Académica
* **Microservicios involucrados:** `academic-engine`.
* **Descripción:** Se conecta al registro general para garantizar que solo se otorguen becas a alumnos de excelencia académica e ininterrumpida.

| Ruta de Prueba | Escenario Técnico & Comportamiento | Respuesta / Resultado Experimento | Captura Requerida (Nombre y Contenido) |
| :--- | :--- | :--- | :--- |
| 🟢 **Camino de Éxito** | Consulta al motor académico de un estudiante activo matriculado en 30 créditos regulares, con promedio semestral `>= 8.5 / 10` y cero materias reprobadas en todo el historial. | Código HTTP `200 OK`. Respuesta del motor: `{"academicValidation": "PASSED", "gpa": 9.4, "failedCourses": 0}`. | `01_c_exito_promedio_85.png`: Captura con el JSON de respuesta demostrando un promedio alto y `academicValidation: "PASSED"`. |
| 🔵 **Camino Alterno** | El alumno cursa Ingeniería o Ciencias Exactas y posee un promedio semestral de `8.1 / 10` (ligeramente debajo del 8.5 universal). No obstante, el sistema evalúa su cohorte y constata que se encuentra dentro del **Top 5% del rendimiento más alto de su carrera**, aprobándolo por mérito comparado de especialidad. | Código HTTP `200 OK`. Respuesta: `{"academicValidation": "PASSED_BY_TOP_PERCENTILE", "gpa": 8.1, "percentile": 3.8}`. | `02_c_alterno_top_5_merito.png`: Captura reflejando aprobación por ubicarse en el percentil superior del 5% (`PASSED_BY_TOP_PERCENTILE`). |
| 🔴 **Excepción / Error** | 1) Estudiante con promedio general de `7.4 / 10` y una materia en arrastre actual o de tercera matrícula.<br>2) Estudiante que se encuentra cumpliendo una sanción disciplinaria y con matrícula suspendida temporalmente por consejo universitario. | Código HTTP `400 Bad Request` o `422 Unprocessable Entity`. JSON: `{"academicValidation": "FAILED", "reason": "FAILED_COURSE_CURRENT_TERME or GPA_BELOW_MINIMUM"}`. | `03_c_excepcion_materia_arrastre_400.png`: Captura del rechazo del servicio detallando como causa principal el promedio insuficiente o materias reprobadas. |

---

### 🟡 Caso 05 (Riesgo Medio): Subida Seguro y Almacenamiento de Evidencia Documentaria
* **Microservicios involucrados:** `document-service` + `student-portal`.
* **Descripción:** Garantiza el repositorio confiable de pruebas (cédula de identidad, planilla de luz/agua, cuenta bancaria en PDF) salvaguardando la plataforma frente a malware.

| Ruta de Prueba | Escenario Técnico & Comportamiento | Respuesta / Resultado Experimento | Captura Requerida (Nombre y Contenido) |
| :--- | :--- | :--- | :--- |
| 🟢 **Camino de Éxito** | En el `student-portal`, el alumno carga una copia de su cédula en formato `.pdf` ligero (< 2MB). El servicio recibe el flujo binario, valida los Magic Numbers de cabecera PDF, calcula el HASH criptográfico e indexa en base de datos devolviendo el recurso seguro. | Código HTTP `201 Created` o `200 OK`. Respuesta con metadata, UUID único de fichero y `status: "VERIFICATION_PENDING"`. | `01_c_exito_carga_pdf.png`: Captura de Postman o del navegador con el archivo cargado satisfactoriamente respondiendo su HASH o ID de almacenamiento. |
| 🔵 **Camino Alterno** | El evaluador humano previamente observó un documento por considerarlo borroso. El estudiante re-entra al portal y **sube una nueva versión** de reemplazo para ese mismo requisito. El servicio manda el documento viejo a la tabla de archivo histórico inactivo e inyecta la nueva versión en revisión. | Código HTTP `200 OK`. Retorna confirmación con control de versiones: `{"docId": "uuid-...", "version": 2, "previousArchive": "ARCHIVE_STATE"}`. | `02_c_alterno_reemplazo_observado.png`: Captura de respuesta demostrando que es una re-subida exitosa con incremento en el número de versión (ej. `version: 2`). |
| 🔴 **Excepción / Error** | 1) **Ataque / Extensión Prohibida:** El usuario altera el nombre de un virus (`script.exe` o `.apk`) y lo intenta subir camuflado como `cedula.pdf.exe`. El detector lo bloquea instantáneamente.<br>2) **Desbordamiento:** Intenta subir un escaneo colosal de 30MB (> 5MB límite permitido). | Para formato erróneo/malicioso: Código `415 Unsupported Media Type`. Para archivo gigante: Código `413 Payload Too Large`. | `03_c_excepcion_extension_maliciosa_415.png`: Captura explícita del error de rechazo de tipo de medio (`415`) o exceso de tamaño de archivo (`413`). |

---

## 2️⃣ Manual Herramienta por Herramienta: Qué hacer y Cómo tomar tus Evidencias

Aquí está el procedimiento paso a paso de lo que tienes que hacer para cada rubro con comandos, clics y lineamientos exactos para alimentar tu carpeta de evidencias.

### 🛠️ Herramienta 1: Pruebas Funcionales (Selenium / Cucumber y Postman/Newman)
Para justificar de forma excelente ante la cátedra u organización el por qué eliges esta tecnología:
> **Justificación Técnica:** Nuestra arquitectura consta de Microservicios REST JSON tras un API Gateway y un Frontend (`student-portal`). **SoapUI** es anticuado (enfocado a servicios XML/WSDL tradicionales); **Cucumber (BDD / Gherkin)** con **Selenium/Playwright** (o Postman para APIs) nos permite articular pruebas vivas legibles en lenguaje natural y tomar fotos en cada aserción.

#### ¿Qué debes hacer paso a paso?
1. **Opción Rápida e Impecable por API (Con Postman/Newman HTML Extra):**
   * Tienes las colecciones de la plataforma en la carpeta [postman/](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/postman).
   * Abre tu terminal de Windows (PowerShell), instala el generador de reportes visual en HTML de Newman y ejecuta las colecciones contra el API Gateway de tus contenedores Docker:
     ```powershell
     npm install -g newman newman-reporter-htmlextra
     newman run postman/collections/tu_coleccion.json -e postman/environments/qa.json -r htmlextra --reporter-htmlextra-export evidencias_qa/01_funcionales/reporte_completo_api.html
     ```
   * Abre el archivo `reporte_completo_api.html` en Chrome. Verás todo un panel web hermoso con estadísticas verdes/rojas detalladas. **Toma capturas de pantalla de los desplegables del panel HTML** de Newman para cada uno de los 5 casos divididos por éxito, alterno y excepción, guardando las 15 fotos en sus carpetas en `evidencias_qa/01_funcionales/`.

2. **Opción Automatizada por Navegador Web (Con Cucumber + Selenium o Playwright):**
   * Puedes automatizar que tu código de pruebas en Selenium/Playwright le tome una captura al navegador web web sin intervención humana cada vez que termine de correr cada historia de usuario Gherkin (ej. al verificar login, al subir PDF):
   * **Inyecta este código en tus Hooks `@After` / `afterEach` de prueba de frontend:**
     ```javascript
     afterEach(async function () {
       // Si estás en Playwright:
       await page.screenshot({ path: `evidencias_qa/01_funcionales/Caso_${this.currentTest.title.replace(/ /g, '_')}.png`, fullPage: true });
       
       // O Si usas Selenium WebDriver:
       // const image = await driver.takeScreenshot();
       // fs.writeFileSync(`evidencias_qa/01_funcionales/${testName}.png`, image, 'base64');
     });
     ```
   * **Resultado:** Ejecutas el test de interfaz con `npm run test` y tus capturas del navegador (éxito con check verde, alterno por reemplazo, error por contraseña rechazada) se autogeneran sin hacer un solo clic de más.

---

### 🚀 Herramienta 2: Pruebas de Rendimiento y Carga (k6 vs JMeter)
> **Justificación Técnica:** Ya poseemos el script de prueba pre-configurado en nuestro repositorio: [tests/k6/login.js](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/tests/k6/login.js). Elegimos **k6** por encima de **JMeter** debido a que se codifica pura y directamente en JavaScript ES6 (homogéneo con nuestro ecosistema monorepo Node/TS) y no devora masivamente la memoria RAM de nuestros contenedores Docker como la JVM de JMeter.

#### ¿Qué debes hacer paso a paso?
1. **Modificar el Script Actual para Generación de Dashboards Web Automáticos:**
   * Abre tu script actual en [login.js](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/tests/k6/login.js) y añade en las primeras líneas la importación de `k6-reporter`, así como la función `handleSummary` al final para exportar un HTML con gráficas de alto rendimiento:
     ```javascript
     import http from 'k6/http';
     import { check } from 'k6';
     import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

     export const options = {
       scenarios: {
         login_test: {
           executor: 'shared-iterations',
           vus: 100,
           iterations: 25000,
           maxDuration: '2m',
         },
       },
       thresholds: {
         http_req_failed: ['rate<1.0'], // Soportamos fallos programados por bloqueo 429 de Redis
       },
     };

     export default function () {
       const url = 'http://localhost:3000/auth/login'; // o host.docker.internal desde contenedor
       const res = http.post(url, JSON.stringify({ email: 'student@uce.edu.ec', password: 'student123' }), {
         headers: { 'Content-Type': 'application/json' },
       });
       check(res, {
         'status es 200 (Login Exitoso)': (r) => r.status === 200,
         'status es 429 (Bloqueo Rate Limiting por exceso de estrés)': (r) => r.status === 429,
       });
     }

     // 🔥 Hook para crear el reporte visual al culminar las 25,000 peticiones:
     export function handleSummary(data) {
       return {
         "evidencias_qa/02_rendimiento_k6/reporte_dashboard_k6.html": htmlReport(data),
       };
     }
     ```
2. **Ejecuta k6 con tu motor CLI (vía Windows, Linux o Docker):**
   ```powershell
   k6 run tests/k6/login.js
   ```
3. **Las Capturas que debes tomar y guardar:**
   * Al terminar, en tu carpeta `evidencias_qa/02_rendimiento_k6/` se habrá creado solo el archivo `reporte_dashboard_k6.html`. Abre ese HTML con doble clic en tu navegador Chrome.
   * **Captura 1 (`01_stress_login_alto_riesgo.png`):** Toma foto a los **gráficos de pastel (Pie Charts) y barras de aserción (Checks)** donde el reporte muestre cómo se dividieron las respuestas entre los 200 (éxitos al arrancar) y 429 (bloqueos al saturar Redis).
   * **Captura 2 (`02_stress_pagos_saga.png`):** Clona el script de login pero enviando peticiones POST masivas a tu endpoint del servicio de pagos del Saga para demostrar la alta criticidad y captura la latencia de respuesta bajo estrés.
   * **Captura 3 (`03_grafica_latencia_y_cuellos_de_botella.png`):** En el mismo informe de k6, haz zoom en la tabla de métricas de tiempo (`http_req_duration`: Promedio, P95, y Máximo) para adjuntar prueba irrefutable de los milisegundos de respuesta máximos antes del punto de quiebre.

---

### 📊 Herramienta 3: Pruebas Estáticas de Código y Cobertura (SonarQube Community)
> **Justificación Técnica:** Poseemos integrado desde la raíz del workspace nuestro archivo [sonar-project.properties](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/sonar-project.properties) con la clave de proyecto `sonar.projectKey=g4-uce-scholarship-system`. Utilizando **SonarQube Community Edition** y conectándolo al analizador de pruebas de Jest/Vitest, garantizamos el cumplimiento estricto del *Quality Gate*, medición de deuda técnica en horas de código en TypeScript y porcentajes de cobertura exactos.

#### ¿Qué debes hacer paso a paso?
1. **Levanta tu instancia local de SonarQube (si no la tienes corriendo en nube) y realiza el escaneo:**
   ```powershell
   # Si usas Docker para levantar SonarQube en 1 comando rápido en tu PC:
   docker run -d --name sonarqube-community -p 9000:9000 sonarqube:community
   ```
2. Corre el escaneo de tu código desde PowerShell apuntando a tu raíz donde reside tu archivo de configuración:
   ```powershell
   npx sonarqube-scanner
   ```
   *(Asegúrate antes de haber corrido `npm run test -- --coverage` en tus repos para que se generen las carpetas de cobertura LCOV que Sonar lee automáticamente).*
3. **Abre tu portal en `http://localhost:9000` y toma estas 4 capturas obligatorias para tu informe:**
   * **Captura 1 (`01_overview_quality_gate.png`):** Entra a tu proyecto *Scholarship System Platform* y toma una fotografía clara a la cabecera del dashboard principal. Debe observarse en un bloque visual bien delineado el resultado **"Quality Gate: Passed" (Aprobado)** con calificaciones "A" en Confiabilidad y Mantenibilidad, o "Failed" si detecta incidencias severas.
   * **Captura 2 (`02_coverage_porcentaje.png`):** Haz clic en el indicador que marca la **Cobertura de Pruebas (% Coverage / Unit Tests)**. Toma foto donde se muestren los módulos evaluados (por ejemplo cómo los archivos `.service.ts` y `.controller.ts` cuentan con >80% del código cubierto tras haber excluido tus pruebas con `sonar.exclusions` en las properties).
   * **Captura 3 (`03_deuda_tecnica_smells.png`):** Ingresa a la sección de **Maintainability (Mantenibilidad)** y haz captura del contador de *Code Smells* y la proyección oficial del tiempo de **Deuda Técnica** estimada para limpiar el código de duplicados o variables no empleadas.
   * **Captura 4 (`04_seguridad_hotspots.png`):** Navega hasta la pestaña **Security Hotspots (Puntos Críticos de Seguridad)**. Toma una captura donde se constate qué advertencias da Sonar sobre librerías o sintaxis que pudieran entrañar exposición criptográfica o manipulación dudosa del motor SQL (`pg`).

---

### 🛡️ Herramienta 4: Pruebas de Vulnerabilidad y Criticidad de Defectos (OWASP ZAP)
> **Justificación Técnica:** Una plataforma institucional universitaria que transacciona fondos de becas y datos confidenciales es un objetivo primordial de ciberseguridad (Riesgo Muy Alto / Crítico). Realizar escaneos DAST automatizados mediante **OWASP ZAP (Zed Attack Proxy)** sobre la interfaz del API Gateway y microservices asegura el blindaje contra inyección de comandos, fugas de cabeceras, mala implementación de CORS/JWT y el Top 10 OWASP.

#### ¿Qué debes hacer paso a paso?
1. **Instalar y abrir OWASP ZAP en tu sistema Windows.**
2. **Ejecutar el Escaneo Automático (Automated Scan):**
   * Comprueba que tus aplicaciones del monorepo estén encendidas en local o qa (`http://localhost:3000` o la IP devuelta en tus outputs Terraform).
   * En la interfaz inicial de ZAP, selecciona **"Automated Scan" (Escaneo Automático)**.
   * En el campo de **URL to attack (URL a atacar)**, coloca la ruta principal de tu API Gateway o tu Web App (`http://localhost:3000` o `http://localhost:8084` de tu saga/pagos).
   * Pulsa el botón **"Attack" (Atacar)**. ZAP lanzará de forma incesante durante unos minutos arañazos de spiders web de fuerza bruta probando vectores SQL Injection, XSS y fugas de desbordamiento de búfer en tus endpoints.
3. **Generar y exportar el informe oficial automático (en HTML):**
   * Una vez que el progreso de ataque concluya, haz clic en el menú superior en: **Report (Reporte) ➔ Generate Report (Generar Reporte)**.
   * En formato elige **HTML** y ponle la ruta para guardarlo dentro de tu directorio de trabajo en: `evidencias_qa/04_vulnerabilidades_owasp/reporte_scan_owasp_zap.html`.
4. **Las 3 Capturas Manuales clave que sustentarás para analizar la "Criticidad de los Defectos":**
   * **Captura 1 (`01_grafico_criticidad_defectos.png`):** Al abrir el archivo HTML exportado con el navegador web, lo primero que destaca es el resumen con el diagrama de criticidad por banderas de color:
     * 🔴 **High (Alto - Crítico para el sistema de Becas):** Vulnerabilidades inminentes (Ej: *SQL Injection*, *Path Traversal* en tu `document-service`). Si aparecen aquí, denotan riesgo severo imperioso de corrección inmediata.
     * 🟠 **Medium (Medio):** Vulnerabilidades de riesgo considerable (Ej: *Absencia de Anti-Clickjacking Header*, *Tokens sin atributo Secure/HttpOnly*).
     * 🟡 **Low / Informational (Bajo / Informativo):** Incidencias leves de configuración de servidores y cookies.
     * 👉 *¡Tómale captura grande al cuadro resumen de cantidad de alertas para graficar cómo analizas y priorizas los defectos de seguridad de mayor a menor gravedad!*
   * **Captura 2 (`02_detalle_alerta_roja_sqli_o_jwt.png`):** En la propia interfaz de ZAP (en la pestaña inferior de **Alerts / Alertas**), haz doble clic sobre la alerta con la bandera más roja/severa que haya saltado en tus microservices. Haz una captura al panel donde ZAP te detalla cuál endpoint específico vulneró y por qué lo clasifica como altamente crítico para la aplicación.
   * **Captura 3 (`03_evidencia_remediacion_headers.png`):** Al costado del detalle del fallo en ZAP o en el reporte web HTML, captura el recuadro llamado **"Solution" (Solución / Remediación Recomendada)**, justificando ante tus auditores QA cómo debe parcharse ese defecto desde el código fuente de los microservices en Node.js (por ejemplo instalando el middleware de seguridad `helmet` en Express/Fastify).
