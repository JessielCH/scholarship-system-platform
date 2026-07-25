# 📁 Repositorio de Evidencias QA y Calidad (UCE Scholarship Platform)

Este directorio alberga la estructura oficial de evidencias de pruebas funcionales, de rendimiento, estáticas y de vulnerabilidad de la plataforma de becas **UCE Scholarship System Platform**.

Esta jerarquía está preparada para subirse a **GitHub** con todos sus directorios organizados y documentados.

## 🏛️ Estructura del Repositorio de Pruebas

```text
evidencias_qa/
 ├── 01_funcionales/                      <-- Pruebas de los 5 Casos Críticos (Cucumber, Selenium, Newman)
 │    ├── caso_01_autenticacion_y_seguridad/
 │    ├── caso_02_pago_saga_y_notificaciones/
 │    ├── caso_03_elegibilidad_socioeconomica/
 │    ├── caso_04_malla_y_promedio_academico/
 │    └── caso_05_subida_de_documentos/
 ├── 02_rendimiento_k6/                   <-- Pruebas de Carga y Estrés (k6 vs JMeter)
 ├── 03_estaticas_sonarqube/              <-- Inspección de Calidad de Código (SonarQube)
 └── 04_vulnerabilidades_owasp/           <-- Análisis DAST de Ciberseguridad (OWASP ZAP)
```

## 🎯 Instrucciones Globales para la Gestión de Capturas
- En cada subdirectorio existe un archivo `README.md` que explica en detalle el objetivo, qué vamos a hacer, qué hace la prueba y qué rutas (éxito, alternos, excepciones) se evalúan.
- Dentro de cada carpeta verás una subcarpeta llamada `/capturas/` (con un archivo `.gitkeep`). Allí debes guardar las imágenes (`.png`, `.jpg` or reportes `.html`) siguiendo la nomenclatura documentada en cada README.
