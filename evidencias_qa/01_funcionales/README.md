# 🧪 Pruebas Funcionales (5 Casos Críticos de Negocio)

Este directorio centraliza las pruebas funcionales end-to-end y de integración de las APIs y del Portal de Estudiantes de la universidad, utilizando **Cucumber (BDD) + Selenium / Playwright** y **Postman / Newman**.

## 🚀 Justificación Teórica de Herramientas (Selenium vs Cucumber vs SoapUI)
- **Por qué no SoapUI:** SoapUI fue pionero en arquitecturas SOAP y contratos XML (WSDL). En nuestra plataforma empleamos Microservicios distribuidos en Node.js/TypeScript tras un API Gateway nativo en JSON, con un frontend web (`student-portal`).
- **Por qué elegimos Cucumber + Selenium / Playwright & Newman:** 
  - **Cucumber** nos otorga la capacidad de modelar el comportamiento (BDD) en lenguaje natural (*Gherkin*), legibles para la universidad y evaluadores de negocio (Dado/Cuando/Entonces).
  - **Selenium o Playwright** automatizan la interacción con la interfaz gráfica web y permiten configurar un **Hook automático que realiza un pantallazo (.png)** en cada escenario sin intervención humana.
  - **Newman (CLI de Postman)** aprovecha nuestra colección de pruebas existente en [postman/](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/postman) y nos exporta informes visuales completos HTML mediante `--reporter-htmlextra-export`.

## 📂 Organización por Casos de Prueba
Hemos dividido los casos priorizándolos por su **Nivel de Riesgo**:
1. `caso_01_autenticacion_y_seguridad/` 🔴 **Riesgo Muy Alto (Crítico)**
2. `caso_02_pago_saga_y_notificaciones/` 🔴 **Riesgo Muy Alto (Crítico)**
3. `caso_03_elegibilidad_socioeconomica/` 🟠 **Riesgo Medio-Alto**
4. `caso_04_malla_y_promedio_academico/` 🟡 **Riesgo Medio**
5. `caso_05_subida_de_documentos/` 🟡 **Riesgo Medio**

Ingresa a cada caso para consultar las instrucciones detalladas de los caminos evaluados y el directorio de sus correspondientes capturas.
