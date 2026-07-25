# 🔴 Caso 01: Autenticación de Estudiantes e Inicio de Sesión (Riesgo: Muy Alto / Crítico)

## 📌 ¿Qué vamos a hacer y qué hace esta prueba?
Este caso evalúa el mecanismo central de acceso blindado a la plataforma en el servicio de identidad: [identity-service](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/apps/identity-service). 

**¿Qué hace la prueba?** Verifica que únicamente los estudiantes e integrantes universitarios con credenciales legítimas encriptadas en Postgres con `bcryptjs` obtengan su Token JWT de autorización; y certifica que los mecanismos defensivos en caché de Redis actúen cuando se intenta rebasar la seguridad en el API Gateway.

## 🛣️ Detalle de las Rutas de Prueba Evaluadas

### 🟢 1. Camino de Éxito (Happy Path: Inicio de sesión institucional)
* **Acción realizada:** El alumno ingresa `student@uce.edu.ec` y contraseña correcta en el portal web (o vía API POST a `/auth/login`).
* **Comportamiento esperado:** El microservicio verifica la firma, responde un código HTTP `200 OK`, devuelve el payload con el Token JWT encriptado (con expiración de 1h) y el navegador redirige a la pantalla principal del panel de estudiante.

### 🔵 2. Camino Alterno (Sesión caducada con regeneración silenciosa por Refresh Token)
* **Acción realizada:** Un alumno autenticado deja inactiva la pantalla por >60 minutos y su Token JWT principal caduca. Al reabrir o navegar hacia otra sección del panel web, el cliente web detecta la expiración temporal.
* **Comportamiento esperado:** El frontend invoca de forma opuesta al usuario y sin pedir contraseñas una petición silenciosa en fondo al endpoint `/auth/refresh` pasándole el *Refresh Token* válido. El servidor lo autentica, emite un código HTTP `200 OK`, renueva el token temporal por otra hora y la navegación prosigue intacta.

### 🔴 3. Excepciones / Errores Controlados (Fuerza Bruta & Contraseña Errónea)
* **Excepción A (Credenciales erróneas):** El alumno o atacante redacta una clave equivocada. El servidor descarta la coincidencia criptográfica, bloquea el paso y retorna error HTTP `401 Unauthorized` con alerta visual *"Credenciales inválidas"*.
* **Excepción B (Ataque de Fuerza Bruta / Bloqueo por Redis Rate Limit):** Se mandan ráfagas mayores a 20 peticiones continuas de login desde la misma IP en pocos segundos. El contador en Redis excede su umbral de tolerancia y devuelve de inmediato HTTP `429 Too Many Requests` con la advertencia: *"Rate limit exceeded. Too many login attempts. Try again later."*

---

## 📸 Instrucciones de Capturas y Almacenamiento en `/capturas/`

Guarda dentro de la subcarpeta `capturas/` de este directorio las imágenes correspondientes a cada ruta probada con los siguientes nombres exactos:

1. **`01_c_exito_login_jwt.png`** ➔ Captura en Postman o en el navegador del inicio de sesión exitoso donde se observe el mensaje 200 OK y la cabecera/JSON devuelta con la clave `token`.
2. **`02_c_alterno_refresh_token.png`** ➔ Captura de la consola o Network en DevTools mostrando la petición en segundo plano a `/auth/refresh` con retorno exitoso 200 OK regenerando la sesión al vencer el tiempo.
3. **`03_c_excepcion_rate_limit_429.png`** ➔ Captura irrefutable del error HTTP `429` tras la ráfaga masiva y del error HTTP `401` al digitar la clave equivocada.
