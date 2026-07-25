# 🟡 Caso 04: Malla y Promedio Académico (Riesgo: Medio)

## 📌 ¿Qué vamos a hacer y qué hace esta prueba?
Este caso asegura que el estándar de excelencia en la formación pedagógica y matriculación regular no sea quebrantado, auditando el comportamiento de: [academic-engine](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/apps/academic-engine).

**¿Qué hace la prueba?** Consulta el historial de notas, promedios semestrales del ciclo académico y el conteo de asignaturas del estudiante para validar científicamente su elegibilidad al subsidio académico de la UCE.

## 🛣️ Detalle de las Rutas de Prueba Evaluadas

### 🟢 1. Camino de Éxito (Happy Path: Promedio General Superior a 8.5 sin Reprobaciones)
* **Acción realizada:** El motor consulta y calcula las asignaturas aprobadas en el semestre en curso para un estudiante que registra carga horaria regular de 30 créditos completos, promedio semestral `>= 8.5 / 10`, y cero materias reprobadas.
* **Comportamiento esperado:** El microservicio otorga el aval del mérito formativo devolviendo el código HTTP `200 OK` e inyectando al trámite de beca la afirmación positiva: `{"academicValidation": "PASSED", "gpa": 9.2, "activeCredits": 30, "failedCourses": 0}`.

### 🔵 2. Camino Alterno (Criterio de Excelencia Comparada por Cohorte - Top 5%)
* **Acción realizada:** Se evalúa a un estudiante universitario de la facultad de Ingeniería, Ciencias Exactas o Física Teórica cuyo promedio semestral calculado se fija en `8.1 / 10` (por debajo del 8.5 exigido en áreas humanísticas por alta complejidad curricular).
* **Comportamiento esperado:** La lógica alterna del `academic-engine` contrasta este promedio contra el rendimiento general del resto de alumnos inscritos simultáneamente en su misma carrera o facultad. Al constatar que el alumno en cuestión se sitúa dentro del **Top 5% del rendimiento de su cohorte**, se valida su mérito mediante el criterio de excelencia comparativa respondiendo `200 OK` y devolviendo: `{"academicValidation": "PASSED_BY_TOP_PERCENTILE", "gpa": 8.1, "percentileRank": 3.4}`.

### 🔴 3. Excepciones / Errores Controlados (Promedio Insuficiente, Arrastre o Sanción)
* **Excepción A (Materias reprobadas en arrastre o Promedio bajo el umbral):** Se manda a evaluar un historial donde el alumno reprobó una o varias asignaturas o cuyo promedio neto decayó a `7.2 / 10`. El sistema rechaza inmediatamente la pretensión regresando error HTTP `400 Bad Request` u objeto de rechazo formal: `{"academicValidation": "FAILED", "reason": "INSUFFICIENT_GPA_OR_FAILED_COURSE"}`.
* **Excepción B (Matrícula suspendida por proceso sancionador):** Si al verificar en la tabla académica consta un registro de suspensión temporal por sanción disciplinaria estudiantil activa, el microservicio bloquea el acceso de inmediato con código de alerta HTTP `403 Forbidden` (`{"error": "Student under disciplinary suspension"}`).

---

## 📸 Instrucciones de Capturas y Almacenamiento en `/capturas/`

Guarda las fotos o resultados en la subcarpeta `capturas/` de este directorio con estos títulos oficiales:

1. **`01_c_exito_promedio_85.png`** ➔ Captura del resultado en el motor demostrando que un estudiante con promedio de 8.5 o superior (ej. 9.2) recibe su validación exitosa en estado `PASSED`.
2. **`02_c_alterno_top_5_merito.png`** ➔ Captura en la respuesta HTTP o panel evidenciando cómo opera el camino alterno al aprobar por encontrarse en el percentil superior (`PASSED_BY_TOP_PERCENTILE`).
3. **`03_c_excepcion_materia_arrastre_400.png`** ➔ Captura del mensaje tajante de rechazo (código 400 o 403) ante asignaturas reprobadas por arrastre o ante existencia de sanciones en el expediente del alumno.
