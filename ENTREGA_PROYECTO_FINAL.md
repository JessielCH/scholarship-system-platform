# Proyecto Final: Plataforma de Gestión de Becas Universitarias
**Asignatura:** Programación Distribuida  
**Estudiante:** Jessiel CH  
**Fecha:** 2 de junio de 2026  

---

## 1. Descripción General de los Microservicios
Para este proyecto final, se han seleccionado y desplegado dos microservicios fundamentales que establecen la base de la plataforma distribuida:

1. **API Gateway (`api-gateway`):** Punto de entrada único para todos los clientes (web/móvil). Actúa como enrutador inverso, maneja la limitación de peticiones (Rate Limiting usando Redis), y enruta las solicitudes hacia los microservicios internos correspondientes.
2. **Identity Service (`identity-service`):** Microservicio encargado de la autenticación, autorización y gestión de usuarios (estudiantes/administradores). Emite JSON Web Tokens (JWT) y se conecta a su propia base de datos PostgreSQL aislada para guardar credenciales de forma segura.

## 2. Responsabilidad Funcional
- **Bajo Acoplamiento y Alta Cohesión:** El *API Gateway* no conoce nada sobre cómo validar contraseñas; su única responsabilidad es proteger la red interna y enrutar. El *Identity Service* no está expuesto directamente a internet, su responsabilidad es exclusivamente validar reglas de negocio de autenticación y gestionar su esquema de datos.
- **Comunicación:** El API Gateway se comunica con el Identity Service mediante HTTP/REST interno, demostrando comunicación síncrona entre servicios.

## 3. Tecnologías Utilizadas
- **Backend:** Node.js, NestJS (Identity Service), Fastify (API Gateway).
- **Almacenamiento:** PostgreSQL (Datos relacionales) y Redis (Caché y Rate Limiting).
- **Contenedores:** Docker y Docker Compose.
- **Infraestructura como Código (IaC):** Terraform (AWS EC2, VPC, Security Groups).
- **CI/CD:** GitHub Actions y GitHub Container Registry (GHCR).

## 4. Arquitectura General y Configuración de Ambientes
La solución se despliega en **Amazon Web Services (AWS)** utilizando una arquitectura distribuida basada en instancias EC2 aisladas por Security Groups. 
Existen dos ambientes físicamente separados y replicados mediante código Terraform: **QA** y **PRODUCCIÓN**.

- **Red:** Ambos ambientes residen en sus propias VPCs aisladas.
- **Seguridad:** 
  - La instancia `Edge` (que aloja el API Gateway y el Identity Service para este entregable) es la única con salida a internet.
  - La instancia `Database` (PostgreSQL y Redis) reside en una subred privada y solo acepta conexiones desde las instancias internas.
- **Despliegue Diferenciado:** QA usa el bloque CIDR `10.2.0.0/16` mientras Producción usa `10.3.0.0/16`.

## 5. Endpoints Principales
### Microservicio 1: API Gateway
- `POST http://<IP_EDGE>:3000/auth/login`: Recibe credenciales del usuario, aplica validación de rate limit (evita ataques de fuerza bruta) y redirige la petición al Identity Service.

### Microservicio 2: Identity Service
- `POST http://<IP_EDGE>:3001/auth/login`: Procesa el request originado por el Gateway, consulta la base de datos PostgreSQL, valida la contraseña encriptada y genera un JWT de respuesta.

## 6. Problemas Encontrados y Soluciones Aplicadas
1. **Límite de Recursos en AWS Academy (Client.UserInitiatedShutdown):**
   - *Problema:* Al intentar levantar múltiples instancias con tamaños como `t3.small` e intentar reemplazar instancias en caliente, el bot de cumplimiento de AWS Academy apagaba inmediatamente las EC2 por violar las políticas de la capa gratuita y límites de EBS (Disco).
   - *Solución:* Se ajustaron todos los módulos de Terraform para utilizar estrictamente instancias `t2.micro`, manteniéndose dentro de los límites del Learner Lab. Se eliminó el almacenamiento excesivo.
2. **Dependencias e Incompatibilidad de Módulos (CI/CD):**
   - *Problema:* Discrepancias de versiones (`fastify-plugin`) y rutas de compilación TypeScript causaban que el contenedor fallara al iniciar en la nube.
   - *Solución:* Se fijaron las versiones en `package.json` y se ajustó el `tsconfig.json`. Todo el flujo de despliegue se automatizó con **GitHub Actions**, construyendo imágenes pre-validadas y alojándolas en GHCR. Se implementó `user_data` en Terraform para auto-instalar Docker en las EC2.

## 7. Conclusiones Técnicas
- El uso de **Infrastructura como Código (Terraform)** garantiza que los ambientes de QA y Producción sean 100% idénticos y replicables, evitando el error humano (Drift de Configuración).
- Aislar la base de datos en instancias diferentes con **Security Groups** estrictos mejora radicalmente la postura de seguridad de la arquitectura distribuida.
- Implementar un **API Gateway** permite centralizar el control de tráfico y seguridad, ocultando la topología real de los microservicios internos.

---

# EVIDENCIAS (Adjuntar imágenes aquí)

## A. Repositorio
- **Enlace del repositorio:** [Pegar URL aquí]
- *Nota: El repositorio incluye historial de commits, archivos Terraform, flujos de Github Actions y código fuente.*

## B. Ambiente QA
- **URL / IP del Endpoint:** `http://<IP_PUBLICA_QA>:3000/auth/login`
- **[Pegar captura de pantalla de AWS mostrando las EC2 de QA corriendo]**
- **[Pegar captura de pantalla de Postman consumiendo la IP de QA con un 200 OK y el Token JWT]**
- **[Pegar captura de los logs de los contenedores Docker en QA]**

## C. Ambiente PRODUCCIÓN
- **URL / IP del Endpoint:** `http://<IP_PUBLICA_PROD>:3000/auth/login`
- **[Pegar captura de pantalla de AWS mostrando las EC2 de PROD corriendo de manera independiente]**
- **[Pegar captura de pantalla de Postman consumiendo la IP de PROD con un 200 OK y el Token JWT]**
