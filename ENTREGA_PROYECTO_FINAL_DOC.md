# Proyecto Final - Programación Distribuida

**Nombre del Proyecto:** Scholarship System Platform (Plataforma de Becas)
**Nombre del Estudiante:** Jessiel Chasiguano

## 1. Descripción General de los Microservicios
Para esta entrega, se han implementado funcionalmente dos microservicios core de la arquitectura:

1. **API Gateway (Edge):** Actúa como el punto de entrada único para las peticiones externas. Se encarga de enrutar las solicitudes hacia los microservicios internos correspondientes, implementar limitación de tasa (Rate Limiting) utilizando Redis, y aislar la red interna de internet.
2. **Identity Service (Autenticación y Autorización):** Microservicio encargado de gestionar las identidades, emitir tokens JWT, validar credenciales y mantener el estado de los usuarios. Se conecta de manera exclusiva a una base de datos PostgreSQL.

## 2. Responsabilidad Funcional y Arquitectura
- **Bajo Acoplamiento y Alta Cohesión:** El *API Gateway* no conoce nada sobre cómo validar contraseñas; su única responsabilidad es proteger la red interna y enrutar. El *Identity Service* no está expuesto directamente a internet, su responsabilidad es exclusivamente validar reglas de negocio de autenticación y gestionar su esquema de datos.
- **Comunicación e Integración:** El API Gateway se comunica con el Identity Service mediante HTTP/REST interno, demostrando comunicación síncrona entre servicios.

## 3. Tecnologías Utilizadas
- **Backend:** Node.js, NestJS (Identity Service), Fastify (API Gateway).
- **Almacenamiento:** PostgreSQL (Datos relacionales) y Redis (Caché y Rate Limiting).
- **Contenedores:** Docker y Docker Compose.
- **Infraestructura como Código (IaC):** Terraform (AWS EC2, VPC, Security Groups).
- **CI/CD:** GitHub Actions y GitHub Container Registry (GHCR).

## 4. Arquitectura General y Configuración de Ambientes
La solución se despliega en **Amazon Web Services (AWS)** utilizando una arquitectura distribuida basada en instancias EC2 aisladas por Security Groups. Existen dos ambientes físicamente separados y replicados mediante código Terraform: **QA** y **PRODUCCIÓN**.

- **Red:** Ambos ambientes residen en sus propias VPCs aisladas. QA usa `10.2.0.0/16` y Prod usa `10.3.0.0/16`.
- **Seguridad y Despliegue Diferenciado:** 
  - La instancia `Edge` (API Gateway e Identity Service) es la única con salida a internet.
  - La instancia `Database` (PostgreSQL y Redis) reside en una subred privada y solo acepta conexiones desde las instancias internas.

## 5. Endpoints Principales
### Microservicio 1: API Gateway
- **POST** `/auth/login` (Rutea tráfico al Identity Service)
- **POST** `/auth/register` (Rutea tráfico al Identity Service)
*(Implementa rate limiting global a través de Redis).*

### Microservicio 2: Identity Service
- **POST** `/login` (Valida credenciales contra PostgreSQL y emite JWT).
- **POST** `/register` (Crea usuario en DB y hashea contraseñas).

## 6. Evidencias de Pruebas y Despliegue
*(NOTA: Debes adjuntar aquí las URLs públicas, capturas de pantalla de Postman consumiendo tu API en QA y PROD, y capturas de la consola de AWS o GH Actions).*

### QA
- **URL Base:** `http://<IP_PUBLICA_QA>:3000`
- [Insertar Capturas de Postman de QA]
- [Insertar Logs de la instancia QA]

### PRODUCCIÓN
- **URL Base:** `http://<IP_PUBLICA_PROD>:3000`
- [Insertar Capturas de Postman de PROD]
- [Insertar Capturas de AWS Console]

## 7. Problemas Encontrados y Soluciones Aplicadas
- **Límites de AWS Academy:** Al desplegar 5 instancias EC2 mediante Terraform, AWS interrumpió el proceso (`Client.UserInitiatedShutdown`) debido a violaciones de políticas estrictas de capa gratuita (Límite de discos EBS e instancias `t3.small`). **Solución:** Se redujeron los tipos de instancias a `t2.micro` y se limpiaron recursos residuales.
- **Instalación Manual en Ambientes Aislados:** Era inviable instalar software manualmente en subredes privadas. **Solución:** Se inyectaron scripts de `user_data` en Terraform para auto-instalar Docker, y se utilizó GitHub Actions para automatizar el SSH Jump hacia la instancia pública.

## 8. Conclusiones Técnicas
La implementación demuestra con éxito el flujo de vida completo del desarrollo de software moderno: desde el código fuente gestionado en un monorepo (Turborepo), la empaquetación mediante Docker, el despliegue automático mediante un pipeline de CI/CD, hasta el aprovisionamiento dinámico de infraestructura aislada en la nube con Terraform, cumpliendo cabalmente con los principios de sistemas distribuidos y alta disponibilidad esperados.
