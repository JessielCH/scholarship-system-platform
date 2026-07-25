# 🔴 Caso 02: Proceso de Aprobación, Emisión de Pago de Beca y Notificaciones (Riesgo: Muy Alto / Crítico)

## 📌 ¿Qué vamos a hacer y qué hace esta prueba?
Este caso evalúa la transacción financiera central de la universidad coordinada entre varios microservices: [payment-service](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/apps/payment-service), [workflow-saga](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/apps/workflow-saga), el bróker RabbitMQ/MQTT, y la persistencia en Apache Cassandra del hub de alertas.

**¿Qué hace la prueba?** Certifica que una orden de pago aprobada mantenga una coherencia transaccional ACID estricta distribuida por el patrón Saga, se propague una notificación confirmatoria por colas de mensajería al estudiante y se efectúe una **Compensación y Rollback automático** en caso de colapso en el circuito bancario.

## 🛣️ Detalle de las Rutas de Prueba Evaluadas

### 🟢 1. Camino de Éxito (Happy Path: Aprobación y desembolso bancario completado)
* **Acción realizada:** El Comité Universitario de Becas emite la aprobación final. El orquestador `workflow-saga` invoca una transacción POST al `payment-service`.
* **Comportamiento esperado:** El servicio realiza exitosamente el cargo al banco. Se publica un evento en RabbitMQ que el servicio `notification-hub` consume para archivar en su base NoSQL Cassandra y remitir un correo electrónico de confirmación de depósito al estudiante. La Saga concluye respondiendo `200 OK` con estado `PAYMENT_COMPLETED`.

### 🔵 2. Camino Alterno (Enrutamiento automático de respaldo por canal corresponsal interbancario)
* **Acción realizada:** Al iniciarse el cobro por la pasarela bursátil principal (Banco del Estado/Principal), el enlace primario presenta timeout o una ventana de mantenimiento programado por hora pico.
* **Comportamiento esperado:** El circuito en el `payment-service` intercepta la latencia excesiva sin fallar la transacción; conmuta en milisegundos hacia la pasarela secundaria o corresponsalía programada. La transacción bancaria termina satisfactoriamente devolviendo `200 OK` junto al flag de auditoría: `{"status": "PAYMENT_COMPLETED", "route_used": "SECONDARY_ROUTER"}`.

### 🔴 3. Excepciones / Errores Controlados (Rollback Transaccional en el Saga y Cuenta Inoperante)
* **Excepción (Fallo bancario por cuenta embargada o incorrecta y activación del Rollback):**
  * **Acción realizada:** El número de cuenta corriente adjuntado por el estudiante está inactivo, erróneo o se encuentra cancelado a nivel interbancario. El banco principal y de respaldo rechazan rotunda y firmemente la orden de transferencia con código de fallo severo (`500 Server Error` o `502 Bad Gateway`).
  * **Comportamiento esperado:** El orquestador `workflow-saga` detecta la imposibilidad financiera de cumplir el desembolso e inicia la **Acción de Compensación / Rollback**. Revierte las tablas intermedias, altera el estado del beneficio a `PAYMENT_FAILED`, aborta el depósito en curso y dispara una alerta al tablero del personal administrativo financiero del campus indicando *"Transacción fallida por rechazo de cuenta bancaria"*.

---

## 📸 Instrucciones de Capturas y Almacenamiento en `/capturas/`

Guarda dentro de la subcarpeta `capturas/` de este directorio las imágenes demostrando cada etapa con los siguientes nombres:

1. **`01_c_exito_pago_procesado.png`** ➔ Captura de la respuesta HTTP `200 OK` en tu colección de Newman/Postman o log de base de datos exponiendo el estado final del saga como `PAYMENT_COMPLETED` junto al mensaje enviado a RabbitMQ.
2. **`02_c_alterno_pasarela_secundaria.png`** ➔ Captura del payload de respuesta donde se aprecie la transacción efectuada por el canal alterno de redundancia (`route_used: SECONDARY_ROUTER`).
3. **`03_c_excepcion_rollback_saga_500.png`** ➔ Captura demostrando el fallo provocado de transferencia bancaria (`500/502`), donde se evidencie cómo el Saga ejecutó inmediatamente el Rollback de la transacción cambiando el registro al estado de rechazo `PAYMENT_FAILED`.
