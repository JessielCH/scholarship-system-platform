# Manual para Video de Pruebas: Microservicios y Bases de Datos

Este manual está diseñado para guiarte paso a paso durante la grabación de tu video demostrativo. Cubre las pruebas de los microservicios usando **Postman** (a través del API Gateway) y el acceso a los nodos y bases de datos usando **CMD (Consola)**.

## 📋 Resumen de la Infraestructura
* **Edge Node (API Gateway público)**: `174.129.86.32` (El único con acceso a internet)
* **Core Node (Academic Engine)**: `10.3.11.226`
* **Security Node (Identity Service)**: `10.3.11.203`
* **Compute Node (Socioeconomic Validator)**: `10.3.11.204`
* **Database Node (Postgres + Redis)**: `10.3.11.136`

---

## 🎬 PARTE 1: Pruebas con Postman (Microservicios)

Tu API Gateway expone todos los microservicios a través de la IP pública por el puerto `3000`.

### 1. Identity Service (Autenticación)
Vamos a iniciar sesión para obtener un token JWT.
* **Método**: `POST`
* **URL**: `http://174.129.86.32:3000/api/auth/login`
* **Headers**: `Content-Type: application/json`
* **Body** (Raw JSON):
```json
{
  "email": "admin@uce.edu.ec",
  "password": "admin123"
}
```
* **Acción en el video**: Muestra cómo al enviar la petición, el sistema responde con un `access_token`. Copia ese token.

### 2. Academic Engine (Procesamiento de Datos)
Vamos a ejecutar un proceso masivo autenticado.
* **Método**: `POST`
* **URL**: `http://174.129.86.32:3000/api/v1/commands/academic/process`
* **Headers**:
  * `Authorization`: `Bearer <PEGA_AQUÍ_TU_TOKEN>`
  * `X-User-Role`: `ADMIN`
* **Acción en el video**: Envía la solicitud y muestra cómo el motor académico acepta y comienza a procesar los miles de registros generados en la base de datos.

### 3. Otros Microservicios (Ejemplo Socioeconómico)
Si tienes un endpoint en el validador socioeconómico o quieres mostrar que la ruta responde a través del gateway:
* **Método**: `GET` o `POST`
* **URL**: `http://174.129.86.32:3000/socioeconomic/...`
*(Ajusta la URL dependiendo del endpoint exacto de tu controlador en Java)*

---

## 🎬 PARTE 2: Pruebas con CMD (Acceso a Bases de Datos)

Dado que las bases de datos están en subredes privadas, **no puedes acceder directamente desde tu computadora local**. En el video, deberás demostrar cómo usas el nodo `Edge` como "puente" (Jump Host) para entrar a los nodos privados.

Abre tu `cmd` o PowerShell y asegúrate de estar en la carpeta donde tienes tu archivo `.pem` (tu llave SSH de AWS).

### 1. Conexión al Nodo Puente (Edge)
Primero entramos al servidor público:
```bash
ssh -i "tu_llave.pem" ubuntu@174.129.86.32
```
*(En el video explica: "Primero entro al API Gateway público, que me servirá de puente hacia la red privada")*

### 2. Conexión al Nodo de Base de Datos
Una vez dentro del servidor Edge, notarás que el prompt cambia a algo como `ubuntu@ip-10-3-1-...`. Ahora, desde ahí mismo, saltamos al servidor de Base de Datos usando su IP privada:
```bash
ssh ubuntu@10.3.11.136
```
*(Si te pregunta "Are you sure you want to continue connecting?", escribe `yes`)*

### 3. Entrar a PostgreSQL (Identity Service DB)
Una vez en el Database Node, veremos que los servicios corren en contenedores Docker. Para entrar a la terminal interactiva de Postgres:

1. Lista los contenedores para mostrar que están corriendo:
```bash
sudo docker ps
```
2. Ejecuta el cliente `psql` dentro del contenedor de base de datos (asumiendo que se llama `postgres` o `database-postgres-1`):
```bash
sudo docker exec -it $(sudo docker ps -qf "name=postgres") psql -U postgres -d identitydb
```
3. Ya dentro de Postgres, ejecuta una consulta para mostrar los usuarios generados por el Seed:
```sql
\dt
SELECT id, email, role FROM "user" LIMIT 5;
```
*(En el video: Muestra que la tabla "user" existe y tiene los datos insertados masivamente)*
4. Sal de Postgres escribiendo: `\q`

### 4. Entrar a Redis (Academic Engine Cache)
Desde el mismo Database Node, ahora entraremos a la base de datos Redis.

1. Entra al cliente de línea de comandos de Redis:
```bash
sudo docker exec -it $(sudo docker ps -qf "name=redis") redis-cli
```
2. Ejecuta comandos para verificar las llaves almacenadas:
```bash
# Ver cuántas llaves existen
DBSIZE

# Obtener 5 llaves al azar de los estudiantes cacheados
SCAN 0 COUNT 5
```
3. Sal de Redis escribiendo: `exit`

### 5. (Opcional) Verificar los logs de los Microservicios
Si quieres ganar puntos extra en tu video, sal del nodo de base de datos (`exit`) y entra al nodo **Core** o **Security** para ver los logs en vivo.

Desde el Edge Node:
```bash
# Entrar al Core Node (Academic Engine)
ssh ubuntu@10.3.11.226

# Ver los logs del contenedor en tiempo real
sudo docker logs -f $(sudo docker ps -qf "name=core")
```
*(Puedes ir a Postman, enviar una petición de nuevo y mostrar en la consola cómo aparecen los logs de la petición llegando al microservicio)*

---
## 💡 Consejos para la Grabación
* Ten tu archivo `.pem` a mano.
* Ten Postman abierto y configurado con las URLs y el body preparado.
* Habla pausado y explica el concepto de "Red Privada vs Red Pública", a los profesores les encanta ver que comprendes por qué estás usando un nodo puente (`Edge`).
