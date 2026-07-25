# 🟠 Caso 03: Evaluación de Elegibilidad Socioeconómica (Riesgo: Medio-Alto)

## 📌 ¿Qué vamos a hacer y qué hace esta prueba?
Este caso supervisa la lógica algorítmica de equidad comunitaria en el servicio de valoración: [socioeconomic-validator](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/apps/socioeconomic-validator).

**¿Qué hace la prueba?** Recibe la información económica del hogar estudiantil proporcionada al departamento de Trabajo Social de la UCE, procesa las tablas de ingresos del hogar y califica matemáticamente si el alumno entra en los quintiles socioeconómicos autorizados para recibir una beca de apoyo de sustentabilidad.

## 🛣️ Detalle de las Rutas de Prueba Evaluadas

### 🟢 1. Camino de Éxito (Happy Path: Aprobación directa en Quintiles 1 y 2)
* **Acción realizada:** Se ingresa y procesa una ficha de postulación donde el cómputo de ingresos per cápita del grupo familiar ubica al alumno con índices dentro de Quintil 1 o Quintil 2 de vulnerabilidad económica.
* **Comportamiento esperado:** El microservicio efectúa las comparaciones, certifica automáticamente el requisito, responde un código HTTP `200 OK` y emite el payload de verificación verde: `{"isEligible": true, "score": 95, "quintil": 1, "status": "SOCIOECONOMIC_QUALIFIED"}`.

### 🔵 2. Camino Alterno (Ponderación Afirmativa por Equidad Territorial o Zona Rural)
* **Acción realizada:** Un postulante se ubica en el Quintil 3 de ingresos familiares (lo que en condiciones regulares citadinas representaría un rechazo o límite limítrofe por falta de cupos), sin embargo, en su domicilio y parroquia de residencia consta el atributo de **Zona Rural de Atención Prioritaria o Comunidad Indígena**.
* **Comportamiento esperado:** El motor aplica un factor multiplicador corrector de equidad territorial afirmativo que le concede puntos de bonificación en su calificación socioeconómica, aprobando favorablemente su solicitud con el código HTTP `200 OK` y el mensaje explicativo: `{"isEligible": true, "equityBonusApplied": true, "reason": "APPROVED_BY_RURAL_EQUITY"}`.

### 🔴 3. Excepciones / Errores Controlados (Rechazo por Exceder Techos Económicos y Datos Erróneos)
* **Excepción A (Rechazo al exceder techos máximos):** La evaluación arroja que el estudiante pertenece al Quintil 5 con ingresos de hogar 5 veces por encima del salario normado para otorgar subsidios. El servicio retorna el rechazo formal controlado: HTTP `403 Forbidden` (o 200 con flag de ineligibilidad: `{"isEligible": false, "reason": "INCOME_THRESHOLD_EXCEEDED"}`).
* **Excepción B (Datos erróneos o formato corrupto en el payload JSON):** Se reciben cantidades negativas en ingresos monetarios, letras en campos de renta o identificadores JSON malformados por fallo del navegador. El servicio de validación intercepta el schema mal formateado antes de procesarlo y contesta HTTP `422 Unprocessable Entity` con el detalle en rojo del campo defectuoso.

---

## 📸 Instrucciones de Capturas y Almacenamiento en `/capturas/`

Guarda las capturas probando este microservice en la subcarpeta `capturas/` bajo estos títulos:

1. **`01_c_exito_quintil_1_elegible.png`** ➔ Captura en la colección de Postman o pantalla web donde se demuestre cómo una petición con parámetros de Quintil 1 o 2 devuelve el código 200 OK con el parámetro `isEligible: true`.
2. **`02_c_alterno_equidad_territorial.png`** ➔ Captura de la respuesta aprobada demostrando el camino alterno de bonificación por pertenencia rural u equidad comunitaria (`equityBonusApplied: true`).
3. **`03_c_excepcion_ingresos_excedidos_403.png`** ➔ Captura doble del mensaje HTTP `403 Forbidden` rechazando con claridad al postulante del Quintil 5 y del error HTTP `422` ante inserciones de variables económicas corruptas.
