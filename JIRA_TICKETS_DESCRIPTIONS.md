# JIRA TICKETS DESCRIPTIONS

Este documento contiene las historias de usuario y las descripciones técnicas para cada ticket de Jira, organizados por tarea principal y subtareas, listos para copiar y pegar.

---

## 📌 [SCHOL-121] Database Initialization (Fix: 502 Bad Gateway)

### 📖 User Story & Context (Para pegar en la descripción de SCHOL-121)
**As a** system administrator, **I need** the databases to initialize automatically so that the microservices can start correctly without crashing. 

**What we found:** During our audit, we found that the `502 Bad Gateway` error on machine startup occurs because the PostgreSQL container boots empty. It does not create the `identitydb`, `academicdb`, or `socioeconomic_db` databases. Because these databases are missing, the microservices crash in a loop, and the API Gateway fails to route traffic. 
**Resolution:** We are fixing this by automating the DB creation on startup and forcing the Gateway to wait for the services.

### 🛠️ Subtasks (Descripciones para pegar en cada subtarea)

#### [SCHOL-123] 
> **Description:** Create an `infrastructure/db-init/init.sql` file containing the `CREATE DATABASE` SQL statements for all 3 missing databases (`identitydb`, `academicdb`, `socioeconomic_db`).

#### [SCHOL-124] 
> **Description:** Modify the `docker-compose.yml` file to mount the new `init.sql` script directly into the postgres container's `/docker-entrypoint-initdb.d/` directory so it executes on first boot.

#### [SCHOL-125] 
> **Description:** Update the `api-gateway` configuration in `docker-compose.yml` to include `depends_on` rules, ensuring it waits for the microservices to be healthy before attempting to route traffic.

---

## 📌 [SCHOL-126] Identity Service & Admin Registration

### 📖 User Story & Context (Para pegar en la descripción de SCHOL-126)
**As a** security administrator, **I need** a secure way to register new admin users so that the system can be properly managed without exposing vulnerabilities.

**What we found:** The system completely lacks an endpoint to register administrators. Currently, the public registration endpoint could potentially be exploited to escalate privileges if not strictly controlled. 
**Resolution:** We are fixing this by separating the registration flows: one public endpoint strictly for students, and one secure endpoint for administrators.

### 🛠️ Subtasks (Descripciones para pegar en cada subtarea)

#### [SCHOL-127] 
> **Description:** Develop a new `POST /auth/register-admin` endpoint in the `apps/identity-service/src/auth/auth.controller.ts` that safely and explicitly assigns the `ADMIN` role.

#### [SCHOL-128] 
> **Description:** Modify the existing `POST /auth/register` endpoint to strip any incoming role requests and strictly default the role to `STUDENT`.

---

## 📌 [SCHOL-129] Frontend Cleanup & Forms

### 📖 User Story & Context (Para pegar en la descripción de SCHOL-129)
**As a** student and admin, **I need** a clean, functional frontend interface so that I can navigate the Saga workflow without confusion.

**What we found:** The `student-portal` contains multiple dead `<button>` and `<Link>` elements that don't do anything, breaking the user experience. Additionally, the system is missing the required UI pages to register admins and process payments. 
**Resolution:** We are fixing this by purging the dead code and building the missing modern (glassmorphism) forms to connect with our new backend endpoints.

### 🛠️ Subtasks (Descripciones para pegar en cada subtarea)

#### [SCHOL-130] 
> **Description:** Build a new Admin Registration Page (`/admin/register`) utilizing a modern glassmorphism design, wired to consume the `/auth/register-admin` endpoint.

#### [SCHOL-131] 
> **Description:** Build a new Payment Management Page (`/payments`) allowing students to view their transaction history and pay pending fees.

#### [SCHOL-132] 
> **Description:** Perform a full audit of the `/dashboard`, `/academic`, and `/admin` pages, removing all unused buttons and links to ensure the UI strictly dictates the defined Saga workflow.

---

## 📌 [SCHOL-133] Academic Engine Refinement

### 📖 User Story & Context (Para pegar en la descripción de SCHOL-133)
**As an** academic reviewer, **I need** the Go academic engine to be fast and allow direct record modifications.

**What we found:** The `academic-engine` microservice only has queries for rankings but lacks standard CRUD endpoints to manage individual academic records. Furthermore, the database queries are unoptimized, and the Redis cache does not invalidate when data changes. 
**Resolution:** We are fixing this by implementing the missing endpoints, adding DB indexes, and configuring cache purging.

### 🛠️ Subtasks (Descripciones para pegar en cada subtarea)

#### [SCHOL-134] 
> **Description:** Implement the missing standard CRUD endpoints (`GET /academic/:id`, `PUT /academic/:id`, `DELETE /academic/:id`) in the Go `academic-engine`.

#### [SCHOL-135] 
> **Description:** Add performance indexes in the PostgreSQL `academicdb` database (specifically on the `faculty` and `career` columns) to speed up querying.

#### [SCHOL-136] 
> **Description:** Implement Redis Cache invalidation logic within the Go service to ensure stale data is purged whenever a record is created or updated.

---

## 📌 [SCHOL-137] Payment Service Completion

### 📖 User Story & Context (Para pegar en la descripción de SCHOL-137)
**As a** student, **I need** to be able to pay my fees and see my past payments so that my scholarship application can proceed.

**What we found:** The `payment-service` has Stripe webhooks configured but no REST endpoints for the frontend to actually initiate a checkout session or fetch a user's payment history. 
**Resolution:** We are fixing this by exposing these core financial endpoints to the frontend.

### 🛠️ Subtasks (Descripciones para pegar en cada subtarea)

#### [SCHOL-138] 
> **Description:** Implement a `GET /payments/user/:userId` endpoint to fetch and return a student's complete transaction history from MariaDB.

#### [SCHOL-139] 
> **Description:** Implement a `POST /payments/checkout` endpoint to generate and return a new Stripe checkout session URL for a student.

---

## 📌 [SCHOL-140] Saga & Microservices Integration Check

### 📖 User Story & Context (Para pegar en la descripción de SCHOL-140)
**As a** system architect, **I need** all 10 microservices to communicate flawlessly so that the orchestrated Saga pattern completes successfully.

**What we found:** Peripheral services like `audit-ledger` and `notification-hub` might be dropping requests due to missing or misconfigured API Gateway routes, and Kafka topics might not be initializing correctly. 
**Resolution:** We are fixing this by doing a final integration sweep on the gateway routes and message broker topics.

### 🛠️ Subtasks (Descripciones para pegar en cada subtarea)

#### [SCHOL-141] 
> **Description:** Verify and update the API Gateway routing rules to ensure traffic for `audit-ledger` and `notification-hub` is correctly mapped without throwing 404 errors.

#### [SCHOL-142] 
> **Description:** Verify the Kafka broker configurations, ensuring that all required topics for the Saga workflow are automatically created or explicitly handled in the code on startup.
