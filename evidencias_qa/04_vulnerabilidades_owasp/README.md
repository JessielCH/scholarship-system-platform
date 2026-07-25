# 🛡️ Pruebas de Vulnerabilidades y Criticidad de Defectos (OWASP ZAP)

Este directorio documenta el escaneo DAST (*Dynamic Application Security Testing*) sobre los microservices y APIs de la universidad, aplicando los estándares de ciberseguridad para mitigar los peligros del **OWASP Top 10**.

## ⚖️ Justificación Técnica: ¿Por qué OWASP ZAP (Zed Attack Proxy)?
- Al ser una plataforma universitaria que almacena expedientes confidenciales y ejecuta transacciones bancarias asociadas al beneficio económico de becas (`payment-service`), el nivel de riesgo de intrusión informática se cataloga como **Extremo / Muy Alto**.
- **OWASP ZAP** es el estándar mundial líder en código abierto para realizar ataques simulados de penetración y fuerza bruta (Spiders web automáticos). Atacando directamente los puertos de nuestro API Gateway o balanceador (`http://localhost:3000`), ZAP intentará fracturar el sistema en busca de inyecciones SQL en Postgres (`pg`), robos de cookies JWT, ausencia de cabeceras CORS o XSS cruzado.

---

## 🛠️ ¿Qué vamos a hacer y cómo generar tu escaneo?

### Paso 1: Realizar el ataque de intrusión automatizado (Automated Scan)
1. Con tus contenedores y microservicios levantados (vía `docker-compose up` o en tu entorno en nube QA), abre la aplicación de escritorio **OWASP ZAP** en Windows.
2. Selecciona la opción gigante **"Automated Scan" (Escaneo Automático)** en su menú de inicio rápido.
3. En el campo titulado **URL to attack (URL a Atacar)**, introduce el endpoint raíz del Gateway o tu frontend interconectado al backend: `http://localhost:3000` (o el puerto del Saga de pagos `http://localhost:8084`).
4. Pulsa en **"Attack" (Atacar)**. ZAP liberará arañas cibernéticas y simulaciones de ataques por saturación durantes varios minutos de prueba intensiva contra tu sistema.

### Paso 2: Generar el Reporte HTML Oficial
Una vez finalizada la ráfaga agresiva del escaneo DAST:
1. Ve al menú superior en OWASP ZAP: **Report (Reporte) ➔ Generate Report (Generar Reporte)**.
2. En las opciones, elige formato **HTML** y pon la ruta exacta para archivarse internamente aquí bajo el nombre: `evidencias_qa/04_vulnerabilidades_owasp/capturas/reporte_scan_owasp_zap.html`.

---

## 📸 Instrucciones de Capturas y "Análisis de Criticidad de Defectos"

Con tu reporte autogenerado HTML en la mano (o con las pestañas en vivo de ZAP), toma las 3 capturas obligatorias en `/capturas/` justificadas así para analizar la criticidad:

### 1. `01_graficos_criticidad_defectos.png` (Resumen general del diagrama de criticidades)
* **¿Qué capturar?** Abre el HTML de reporte de ZAP en tu navegador Chrome. Verás la tabla de cabecera con el **Gráfico Cero-Diferenciado de Alert Flags (Banderas de Alertas de Criticidad)** clasificadas universalmente por gravedad:
  * 🔴 **High (Alto / Defecto Crítico de Seguridad):** Alertas severas (Ej. inyecciones SQL activas en base de datos o *Remote Code Execution*). Representan riesgo inminente con mandato de parchado perentorio para no clausurar el sistema de Becas.
  * 🟠 **Medium (Medio):** Incidencias como *Missing Anti-Clickjacking Header (X-Frame-Options)* o falta de atributo `HttpOnly/Secure` en cabeceras de tokens web JWT.
  * 🟡 **Low (Bajo / Informativo):** Advertencias leves sobre formato de cookies de rastreo y tiempos de expiración de caché de servidor.
  * 👉 *¡Esta captura global comprueba al docente y auditor tu riguroso esquema y métrica de priorización sobre defectos!*

### 2. `02_detalle_alerta_roja_o_naranja.png` (Desglose del defecto de mayor criticidad)
* **¿Qué capturar?** En el propio reporte web de OWASP (o pestaña *Alerts* abajo en la aplicación ZAP), despliega y abre la alerta de mayor severidad detectada (la más roja o naranja, como por ejemplo la falta de cabeceras protectoras en HTTP). Toma un pantallazo donde conste: **1) El Nombre de la Vulnerabilidad, 2) Su Nivel de Severidad (High/Medium) y 3) La URL o endpoint en específico donde ZAP lo descubrió.**

### 3. `03_evidencia_remediacion_headers.png` (Propuesta de Mitigación y Parchado de Código)
* **¿Qué capturar?** En ese mismo apartado del fallo analizado por OWASP ZAP, ubica el recuadro **"Solution" (Solución y Recomendación de Remediación)** y toma la captura donde se enseña la solución oficial de seguridad (por ejemplo cómo programar las directivas con la librería `helmet` en nuestras cabeceras Node.js o habilitar `Content-Security-Policy`).
