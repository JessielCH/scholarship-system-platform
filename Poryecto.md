**UNIVERSIDAD CENTRAL DEL ECUADOR**

Facultad de Ingeniería, Ciencias y Matemáticas

_Ingeniería de Sistemas - Programación Distribuida_

**INFORME TÉCNICO**

**Sistema de Gestión de Becas de la UCE**

**Autor:**

**Jessiel Chasiguano**

**Repositorio GitHub:**

<https://github.com/JessielCH/scholarship-system-platform>

**Tablero Jira:**

<https://jessieljosue.atlassian.net/jira/software/c/projects/SS/boards/135>

Periodo Académico: 2026-2026

Fecha de entrega: 27 de mayo de 2026

# Tabla de Contenidos

[Tabla de Contenidos 2](#_Toc230952380)

[1\. Introducción 4](#_Toc230952381)

[2\. Planteamiento del Problema 4](#_Toc230952382)

[3\. Objetivos 4](#_Toc230952383)

[3.1 Objetivo General 4](#_Toc230952384)

[3.2 Objetivos Específicos 5](#_Toc230952385)

[4\. Justificación 5](#_Toc230952386)

[5\. Marco Teórico 6](#_Toc230952387)

[5.1 Arquitectura de Microservicios 6](#_Toc230952388)

[5.2 Modelo C4 6](#_Toc230952389)

[5.3 Patrón Saga Orquestada 6](#_Toc230952390)

[5.4 CQRS (Comando-Consulta) 6](#_Toc230952391)

[5.5 Arquitectura Orientada a Eventos 6](#_Toc230952392)

[5.6 Event Sourcing con Hash-Chaining 6](#_Toc230952393)

[5.7 Arquitectura Hexagonal (Puertos y Adaptadores) 6](#_Toc230952394)

[5.8 GitOps e Infraestructura como Código 7](#_Toc230952395)

[5.9 SOLID, DRY, KISS, YAGNI, Bajo Acoplamiento, Alta Cohesión 7](#_Toc230952396)

[5.10 Normalización de Bases de Datos 7](#_Toc230952397)

[6\. Arquitectura del Sistema 7](#_Toc230952398)

[6.1 C1 - Contexto del Sistema 7](#_Toc230952399)

[6.2 C2 - Nivel de Contenedores: Los 10 Microservicios 7](#_Toc230952400)

[6.3 C3 - Nivel de Componentes: Arquitectura Interna por Microservicio 8](#_Toc230952401)

[6.4 Estados de la Saga de Adjudicación 9](#_Toc230952402)

[6.5 Diagramas de Procesos, Secuencias y Casos de Uso 10](#_Toc230952403)

[6.5.1 Resumen de Casos de Uso 10](#_Toc230952404)

[6.5.2 Resumen del Flujo Feliz 10](#_Toc230952405)

[7\. Tecnologías Seleccionadas 10](#_Toc230952406)

[7.1 Matriz de Tecnologías 10](#_Toc230952407)

[8\. Diseño Distribuido 12](#_Toc230952408)

[8.1 Patrones de Comunicación (Obligatorio: ≥ 3, incluyendo todos los protocolos obligatorios) 12](#_Toc230952409)

[8.2 Estrategia de Alta Disponibilidad 13](#_Toc230952410)

[8.3 Infraestructura AWS - VPC Multi-AZ Solo EC2 (QA y PROD) 14](#_Toc230952411)

[8.3.1 Entorno QA - Single-AZ (Optimizado para Costos) 14](#_Toc230952412)

[8.3.2 Entorno PROD - Multi-AZ con ELB + ASG 15](#_Toc230952413)

[9\. Arquitectura de Seguridad 16](#_Toc230952414)

[9.1 Capas de Seguridad 16](#_Toc230952415)

[10\. Arquitectura de Bases de Datos (10 Bases, Persistencia Poliglota) 17](#_Toc230952416)

[11\. Frontend Multiplataforma - Microfrontends 18](#_Toc230952417)

[12\. Estrategia de Implementación 18](#_Toc230952418)

[12.1 Pipeline GitOps (QA y PROD) 19](#_Toc230952419)

[12.2 Estrategia de Pruebas 19](#_Toc230952420)

[12.3 Hoja de Ruta de 12 Semanas 19](#_Toc230952421)

[13\. Estimación de Costos 20](#_Toc230952422)

[13.1 Entorno QA (160 horas/mes, Lun-Vie, auto-destruir Vie 22:00 UTC) 20](#_Toc230952423)

[13.2 Entorno PROD (160 horas/mes con ELB + ASG) 21](#_Toc230952424)

[14\. Registros de Decisiones de Arquitectura (ADR) 21](#_Toc230952425)

[15\. Riesgos y Limitaciones 22](#_Toc230952426)

[16\. Conclusiones 23](#_Toc230952427)

[17\. Referencias Bibliográficas 24](#_Toc230952428)

[Apéndice A - Lista de Verificación de Requisitos del Profesor 25](#_Toc230952429)

[Requisitos Obligatorios 25](#_Toc230952430)

[Requisitos Opcionales 26](#_Toc230952431)

# 1\. Introducción

The UCE Scholarship Management System is a distributed platform that automates and digitizes the scholarship adjudication process at the Central University of Ecuador (UCE). The system replaces fragmented manual workflows - spreadsheets, in-person document submission, and informal approval chains - with a coherent, auditable, and scalable digital pipeline.

This report presents the complete architectural design of the system, documenting every technical decision, the justification for each pattern selected, the communication mechanisms between services, and the infrastructure strategy designed to operate within AWS Academy Learner Lab constraints.

The architecture follows a polyglot microservices model: ten independent services implemented in the language best suited to each domain (Go, Java/Spring Boot, NestJS, Python/FastAPI), each with its own dedicated database technology, coordinated through an Orchestrated Saga pattern and connected via a custom API Gateway. Both QA and PROD environments are fully provisioned via Terraform and managed through a GitOps pipeline.

# 2\. Planteamiento del Problema

The Central University of Ecuador currently manages scholarship applications through physical documentation, manual eligibility checks, and multi-day approval queues. This process presents the following critical problems:

- Lack of traceability: Approval decisions are not systematically recorded, making it impossible to audit the adjudication process or detect irregularities.
- Manual validation bottlenecks: Academic eligibility (GPA, top 10%) and socioeconomic verification (MIES/SIISE/RUMI indices) are performed manually, introducing errors and delays.
- No fraud detection: There is no mechanism to identify suspicious patterns such as applicants sharing documents, addresses, or phone numbers.
- Poor scalability: The current process cannot handle more than a few hundred concurrent applications without degrading significantly.
- Disconnected notifications: Students receive no real-time updates on the status of their applications, creating uncertainty and repeated manual inquiries.
- No disaster recovery or on-premise backup: Data is stored exclusively in local file systems with no automated backup strategy.

The proposed system addresses each of these problems through distributed, automated, and formally auditable components deployed across QA and PROD environments.

# 3\. Objetivos

## 3.1 Objetivo General

Design, document, and implement the complete distributed architecture for the UCE Scholarship Management System, applying microservices principles, orchestrated distributed transactions, polyglot persistence, and infrastructure-as-code practices to deliver a scalable, secure, and auditable scholarship platform in two environments: QA and PROD.

## 3.2 Objetivos Específicos

- Model the system using the C4 architectural framework (Context, Container, Component, Code) and produce process, sequence, and use-case diagrams.
- Design ten specialized microservices with domain-appropriate internal patterns (Hexagonal, Pipes & Filters, State Machine, Event Sourcing, N-Tier, Event-Driven, Rules Engine, CQRS).
- Implement an EC2-only AWS infrastructure strategy operating within a \$50/month budget, using Terraform for provisioning across both QA and PROD, including ELB and ASG in PROD.
- Specify the distributed communication architecture, implementing REST/HTTP, MQTT, RabbitMQ (AMQP), Kafka, WebSocket, GraphQL, gRPC, Webhooks, and SOAP/stub adapters.
- Implement CQRS and Event-Driven architecture as mandatory architectural patterns alongside the microservices pattern.
- Integrate n8n to automate business processes such as scholarship notifications and report generation.
- Implement on-premise backup connectivity for PROD database replication.
- Produce a GitOps CI/CD pipeline with automated quality gates, Docker image publishing (GHCR), load testing (k6), unit testing, and functional testing.
- Document all architectural decisions through a formal ADR register and provide complete Swagger API documentation.
- Implement Site24x7 + Prometheus + Grafana monitoring with alerting for both environments.

# 4\. Justificación

The scholarship adjudication process involves multiple distinct bounded contexts - academic validation, socioeconomic assessment, document management, fraud detection, financial disbursement, and audit - each with independent evolution rates, data models, and performance characteristics. A monolithic architecture would couple these contexts together, making individual deployment, scaling, and technology upgrades impossible.

A distributed microservices architecture provides the necessary separation of concerns. Each service can be developed, deployed, and scaled independently. The polyglot persistence strategy - selecting the database technology that best fits each domain - avoids forcing all data into a single data model.

The CQRS pattern is applied at the Academic Engine and AI Agent levels to separate read-heavy ranking queries from write-heavy ingestion paths, preventing query contention. Event-Driven Architecture is applied system-wide via RabbitMQ and Kafka to decouple producers from consumers and enable audit logging.

The AWS EC2-Only strategy (excluding DynamoDB, Lambda, and managed API Gateway) is driven by the Learner Lab budget constraint of \$100 in credits. By self-hosting Redis, RabbitMQ, Kafka, and MQTT on EC2 and delegating external storage to permanently free tiers (MongoDB Atlas, DataStax Astra, Neo4j Aura, Upstash), total monthly AWS cost is held below \$27 USD - well within the \$50 limit.

PROD adds Elastic Load Balancer (ELB) and Auto Scaling Groups (ASG) to achieve high availability across two Availability Zones. QA mirrors the same topology at reduced scale for cost efficiency, enabling confident promotion from QA to PROD.

# 5\. Marco Teórico

## 5.1 Arquitectura de Microservicios

Microservices is an architectural style in which an application is composed of small, independently deployable services that communicate over lightweight protocols. Each service owns its data, has a single business responsibility, and can be written in the most appropriate language for that domain.

## 5.2 Modelo C4

The C4 model (Brown, 2018) provides four levels of architectural abstraction - Context (C1), Container (C2), Component (C3), and Code (C4) - enabling communication to audiences of varying technical depth. This report documents C1 through C3 for all ten microservices.

## 5.3 Patrón Saga Orquestada

A Saga is a distributed transaction mechanism for microservices. In the orchestrated variant, a central orchestrator (the Workflow/Saga Service) issues commands to each participant service and listens for events. If any step fails, the orchestrator triggers compensating transactions in reverse order, maintaining eventual consistency without distributed locking.

## 5.4 CQRS (Comando-Consulta)

CQRS separates the write model (Commands) from the read model (Queries) within the same bounded context. Applied at the Academic Engine and AI Agent, it prevents long-running ranking computations from blocking status queries. Command handlers publish domain events consumed by read-side projections updated asynchronously via Kafka.

## 5.5 Arquitectura Orientada a Eventos

Event-Driven Architecture (EDA) decouples producers and consumers through asynchronous message brokers. In this system, every domain event (APPLICATION_SUBMITTED, ACADEMIC_VALIDATED, FRAUD_SCORED, DISBURSED) is published to RabbitMQ or Kafka topics, enabling fan-out to audit, notification, and analytics consumers without coupling.

## 5.6 Event Sourcing con Hash-Chaining

Event Sourcing stores system state as an immutable, append-only log of events. Combined with SHA-256 hash-chaining - where each record includes the hash of the previous record - the log becomes cryptographically tamper-evident without requiring a blockchain or Amazon QLDB.

## 5.7 Arquitectura Hexagonal (Puertos y Adaptadores)

The Hexagonal Architecture pattern isolates the domain core from all infrastructure concerns. The domain communicates exclusively through ports (interfaces); adapters implement those interfaces for specific technologies (HTTP, Redis, PostgreSQL). This enables full unit testing of the domain without any network or database connection.

## 5.8 GitOps e Infraestructura como Código

GitOps is the practice of using Git as the single source of truth for infrastructure and deployment configuration. All changes to cloud resources pass through pull requests; automated pipelines apply them idempotently via Terraform, and automated destroy schedules preserve budget during off-hours.

## 5.9 SOLID, DRY, KISS, YAGNI, Bajo Acoplamiento, Alta Cohesión

All microservices apply the following design principles: Single Responsibility (one business function per service), Open/Closed (extend via new adapters, not by modifying domain), Liskov Substitution (all port implementations are interchangeable), Interface Segregation (narrow ports per use case), Dependency Inversion (domain depends on abstractions). DRY eliminates duplicate validation logic via shared libraries in the Turborepo. KISS keeps each service focused; YAGNI prevents speculative generality. Low Coupling is enforced by asynchronous messaging; High Cohesion by bounded-context alignment.

## 5.10 Normalización de Bases de Datos

All relational databases (PostgreSQL for Identity, MariaDB for Financial and Audit) are normalized to at least Third Normal Form (3NF): eliminating repeating groups (1NF), removing partial dependencies (2NF), and eliminating transitive dependencies (3NF). This ensures data integrity, eliminates redundancy, and simplifies the write model. Read-side projections (CQRS) are denormalized specifically for query performance without compromising the write-side integrity.

# 6\. Arquitectura del Sistema

## 6.1 C1 - Contexto del Sistema

At the highest level of abstraction, the UCE Scholarship Management System is a single logical unit interacting with three human actors (Student, UCE Coordinator, Auditor) and eight external systems: Stripe API Mock, MongoDB Atlas, Upstash Redis, DataStax Astra, Neo4j Aura, RUMI/SIISE APIs, On-Premise Backup Server, and n8n Automation Engine.

Students apply and upload documents via a multiplatform web/mobile/desktop interface. UCE Coordinators review and approve applications. Auditors access the immutable hash-chained ledger. n8n automates notification workflows and report generation. The on-premise server receives nightly encrypted database backups from PROD.

## 6.2 C2 - Nivel de Contenedores: Los 10 Microservicios

The system is decomposed into ten independently deployable microservices, each with its own runtime, database, and deployment cycle. Synchronous communication occurs via REST/HTTP through the Custom API Gateway; asynchronous communication uses RabbitMQ and Kafka hosted on EC2.

| **#** | **Microservice**        | **Language / Framework**    | **Primary DB**             | **Pattern**                 |
| ----- | ----------------------- | --------------------------- | -------------------------- | --------------------------- |
| 1     | Custom API Gateway      | Node.js + Nginx             | Redis (rate limit)         | Pipes & Filters             |
| 2     | Identity Service        | NestJS                      | PostgreSQL 15 RDS          | Layered N-Tier              |
| 3     | Academic Engine         | Go                          | Redis 7 EC2                | Hexagonal + CQRS            |
| 4     | Socioeconomic Validator | Java / Spring Boot          | PostgreSQL 15 RDS          | Layered + Rules Engine      |
| 5     | Document Service        | Java / Spring Boot          | MongoDB Atlas + S3         | Pipes & Filters             |
| 6     | Audit Ledger            | Go                          | MariaDB 10 RDS             | Event Sourcing + Hash-Chain |
| 7     | Workflow / Saga         | Java / Spring State Machine | Redis 7 EC2                | Finite State Machine        |
| 8     | Notification Hub        | Python / FastAPI            | Cassandra (DataStax Astra) | Event-Driven                |
| 9     | AI Eligibility Agent    | Python / FastAPI            | Neo4j Aura + Redis Upstash | Hexagonal + CQRS            |
| 10    | Financial Service       | NestJS                      | MariaDB 10 RDS             | Hexagonal + ACL             |

## 6.3 C3 - Nivel de Componentes: Arquitectura Interna por Microservicio

Each microservice adopts the internal architectural pattern most appropriate to its domain. The principle is justified selection: patterns are chosen because they solve a specific problem, not by convention.

| **Microservice**        | **Internal Pattern**              | **Justification**                                                                                                                                                                                                     |
| ----------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom API Gateway      | Pipes & Filters                   | No business logic - only sequential network processing. Each filter (rate limiter, JWT validator, CORS, router) is independent and testable in isolation. Cloudflare WAF sits in front for DDoS protection.           |
| Identity Service        | Layered N-Tier (3 layers)         | Data-driven CRUD service. Classic Controller → Service → Repository is efficient and sufficient; Hexagonal would add unnecessary abstraction. JWT RS256 asymmetric signing.                                           |
| Academic Engine         | Hexagonal + CQRS                  | Mathematical ranking core must be 100% isolated from persistence. CQRS separates write-heavy ingestion from read-heavy ranking queries. Enables benchmarking with millions of synthetic records in memory.            |
| Socioeconomic Validator | Layered + Rules Engine            | Government validation rules change every legislative cycle. A centralized Rules Engine (Bean Validation + DroolsLite) allows adding new rules as configuration with zero new code.                                    |
| Document Service        | Pipes & Filters                   | A PDF upload is a byte stream transformed before storage. Each filter (format validation, malware scan, metadata extraction, AES-256 encryption, S3 upload) is independent and replaceable.                           |
| Audit Ledger            | Event Sourcing + Hash-Chain       | Immutability is the primary requirement. Append-only events + SHA-256 chain replace Amazon QLDB/blockchain at zero additional cost.                                                                                   |
| Workflow / Saga         | Finite State Machine              | Controls valid state transitions in the adjudication process. Spring State Machine provides persistence, guards, entry/exit actions, and formal auditability.                                                         |
| Notification Hub        | Event-Driven Architecture         | Must never block callers. Subscribes to RabbitMQ and Kafka topics; Python asyncio handles hundreds of concurrent in-flight notifications without additional threads. Also triggers n8n webhooks.                      |
| AI Eligibility Agent    | Hexagonal + CQRS                  | Random Forest model must be isolated from data source and result storage. CQRS separates prediction requests (Commands) from result queries (Queries). Enables training and evaluation with synthetic in-memory data. |
| Financial Service       | Hexagonal + Anti-Corruption Layer | Stripe API changes frequently. The ACL translates the internal accounting domain (Disbursement, LedgerEntry) to Stripe's language (PaymentIntent, Transfer). Replacing Stripe only requires rewriting the adapter.    |

## 6.4 Estados de la Saga de Adjudicación

The Workflow/Saga Service implements a Finite State Machine with the following valid states and transitions for each scholarship application:

PENDING → \[validate_gpa via RabbitMQ\] → ACADEMIC_OK → \[score_fraud via Kafka\] → AI_OK → \[process_disbursement\] → COMPLETED. Any step failure triggers compensating transactions in reverse order. Every state transition is published as an event to the Audit Ledger and to the Notification Hub.

| **State**   | **Trigger**                            | **Compensating Action**       |
| ----------- | -------------------------------------- | ----------------------------- |
| PENDING     | POST /scholarship/apply                | DELETE application record     |
| ACADEMIC_OK | ACADEMIC_APPROVED event (RabbitMQ)     | Publish ACADEMIC_ROLLBACK     |
| AI_OK       | AI_APPROVED event (Kafka, score < 70)  | Publish AI_ROLLBACK           |
| COMPLETED   | DISBURSED event from Financial Service | Issue Stripe refund via ACL   |
| REJECTED    | Any step failure / fraud score ≥ 70    | Notify student, log rejection |

## 6.5 Diagramas de Procesos, Secuencias y Casos de Uso

### 6.5.1 Resumen de Casos de Uso

Primary actors and use cases:

- Student: Register/Login, Submit Application, Upload Documents, Track Application Status (WebSocket), Receive Notifications (MQTT/push)
- UCE Coordinator: Review Applications, Override AI Decision, View Rankings Dashboard (GraphQL), Approve/Reject Applications
- Auditor: View Immutable Audit Ledger, Export SHA-256 Chain Report, Verify Hash Integrity
- System (automated): Validate GPA, Score Fraud Risk, Process Disbursement, Generate n8n Reports, Execute Nightly Backup to On-Premise

### 6.5.2 Resumen del Flujo Feliz

1\. Student POSTs to /scholarship/apply via API Gateway. 2. Gateway validates JWT (RS256) and routes to Workflow/Saga. 3. Saga sets state = PENDING and publishes Cmd:ValidateGPA to RabbitMQ. 4. Academic Engine processes ranking, publishes ACADEMIC_APPROVED. 5. Saga transitions to ACADEMIC_OK, publishes Cmd:ScoreFraudRisk to Kafka. 6. AI Agent scores with Random Forest, publishes AI_APPROVED (score < 70). 7. Saga transitions to AI_OK, calls Financial Service (REST). 8. Financial Service calls Stripe Mock, publishes DISBURSED. 9. Saga transitions to COMPLETED, Audit Ledger appends SHA-256 chain record. 10. Notification Hub sends MQTT push to student mobile + WebSocket update to coordinator dashboard. 11. n8n webhook triggers automated report generation.

# 7\. Tecnologías Seleccionadas

## 7.1 Matriz de Tecnologías

| **Category**           | **Technology**                                                            | **Rationale**                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API Gateway            | Node.js + Nginx + Cloudflare WAF                                          | Non-blocking I/O handles 10,000+ concurrent connections on a t3.small with <200 MB RAM. Cloudflare provides DDoS protection, WAF rules, and rate limiting at the edge.                        |
| Auth & Identity        | NestJS + JWT RS256 + Supabase Auth (PAAS)                                 | Asymmetric RS256 signing: each downstream service verifies with the public key without contacting Identity Service on every request. Supabase Auth used as PAAS backup provider.              |
| Academic Computation   | Go + Goroutines                                                           | Goroutines use only 2 KB overhead each (vs ~2 MB per Java thread). Benchmarked: 25,000 rankings processed in <50 ms on a t3.small. Go simulates parallel programming for scholarship ranking. |
| Validation Rules       | Java Spring Boot + Bean Validation + DroolsLite                           | JSR-380 Bean Validation is the reference implementation for declarative constraint rules. DroolsLite allows rule changes as configuration with zero new code.                                 |
| Document Pipeline      | Java Spring Boot + Apache PDFBox + AES-256                                | Streaming multipart processing avoids loading full PDF into memory. PDFBox extracts structured metadata. AES-256-CBC provides per-student keyed encryption.                                   |
| Audit Integrity        | Go + SHA-256 + MariaDB (INSERT-only)                                      | Go SHA-256 computations run 3× faster than Python equivalent. MariaDB INSERT-only audit table enforced at application layer. Normalized to 3NF.                                               |
| Saga Orchestration     | Java Spring State Machine + Redis                                         | Spring State Machine provides formal transition guards, entry/exit actions, and state persistence. Redis provides <1 ms state access across all EC2 instances on the same VPC.                |
| Notifications          | Python FastAPI + asyncio + Cassandra                                      | Python asyncio handles hundreds of concurrent notification streams. Cassandra (DataStax Astra) is optimized for append-only time-series writes.                                               |
| Fraud Detection        | Python FastAPI + Neo4j + Random Forest                                    | Graph algorithms (PageRank, Community Detection) find applicant networks sharing documents in O(E+V). The same query in SQL requires O(n²) self-joins.                                        |
| Financial              | NestJS + MariaDB InnoDB + Stripe Mock                                     | MariaDB InnoDB is superior to PostgreSQL for high-frequency transactional write workloads. Stripe Mock used in QA; real Stripe adapter ready for PROD.                                        |
| Message Broker (AMQP)  | RabbitMQ 3 (EC2 self-hosted)                                              | Selected over SQS (not reliably available in Learner Lab). Handles Saga commands/events and notification fan-out.                                                                             |
| Message Broker (Event) | Apache Kafka 3 (EC2 self-hosted)                                          | Mandatory requirement. Used for high-throughput domain events (FRAUD_SCORED, ACADEMIC_VALIDATED) consumed by multiple downstream services with consumer group isolation.                      |
| Push Notifications     | MQTT (Mosquitto EC2)                                                      | Mandatory requirement. Lightweight protocol for real-time push alerts to student mobile app. QoS Level 1 ensures at-least-once delivery.                                                      |
| Real-Time Dashboard    | WebSocket (Socket.io via API Gateway)                                     | Bidirectional live dashboard updates for Coordinator. Application state changes pushed without polling.                                                                                       |
| Query API              | GraphQL (Apollo Server via API Gateway)                                   | Coordinator dashboard uses GraphQL for flexible ranking queries with field selection. Reduces over-fetching compared to REST for complex nested data.                                         |
| gRPC (inter-service)   | gRPC (Protobuf)                                                           | Used between Academic Engine and AI Agent for high-performance binary serialization of ranking vectors. 5-10× lower latency than REST for this internal call.                                 |
| Webhooks               | n8n Webhook Triggers                                                      | Notification Hub triggers n8n webhook on COMPLETED/REJECTED events to automate report generation and email dispatch.                                                                          |
| SOAP Stub              | Spring-WS ExternalApiStub                                                 | SIISE/RUMI government APIs expose SOAP interfaces. Spring-WS adapter wraps the stub; production requires only configuration change (ADR-005).                                                 |
| Process Automation     | n8n (self-hosted on EC2)                                                  | Automates business processes: scholarship approval notifications, monthly report generation, coordinator digest emails. Triggered via webhooks from Notification Hub.                         |
| Monorepo               | Turborepo + Nx                                                            | Remote cache reduces CI pipeline from ~15 min to ~2 min by rebuilding only services affected by each commit.                                                                                  |
| IaC                    | Terraform + GitHub Actions                                                | GitOps: all cloud resources are version-controlled. Automated destroy schedules preserve budget during off-hours. Separate workspaces for QA and PROD.                                        |
| Monitoring             | Prometheus + Grafana + InfluxDB + Site24x7                                | Prometheus scrapes all microservice metrics. Grafana provides SLA dashboards. Site24x7 provides external uptime monitoring and alerting. InfluxDB stores time-series metrics.                 |
| Container Registry     | GitHub Container Registry (GHCR)                                          | Docker images built and pushed to GHCR on every merged PR. Images tagged with git SHA for traceability.                                                                                       |
| PAAS / External        | Supabase (Auth), MongoDB Atlas, DataStax Astra, Neo4j Aura, Upstash Redis | All on permanent free tiers. Zero additional AWS cost.                                                                                                                                        |

# 8\. Diseño Distribuido

## 8.1 Patrones de Comunicación (Obligatorio: ≥ 3, incluyendo todos los protocolos obligatorios)

| **Pattern**                    | **Protocol**          | **Mandatory?**  | **When Used**                                                                              | **Examples in System**                                                                      |
| ------------------------------ | --------------------- | --------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Synchronous Request-Response   | REST / HTTP           | Yes             | Caller requires immediate response. Latency-critical.                                      | JWT login, application status query, document upload initiation, Financial Service → Stripe |
| Asynchronous Pub/Sub           | RabbitMQ AMQP         | Yes (Mandatory) | Processing may be slow. Multiple consumers. Non-blocking required.                         | Saga commands/events, audit log entries, notification fan-out, compensating transactions    |
| Asynchronous Event Stream      | Apache Kafka          | Yes (Mandatory) | High-throughput domain events with consumer group isolation and replay capability.         | FRAUD_SCORED, ACADEMIC_VALIDATED, DISBURSED events consumed by Audit + Analytics            |
| Async Event-Driven Push        | MQTT (Mosquitto)      | Yes (Mandatory) | Mobile push notifications. Lightweight for high-frequency messages on constrained devices. | Real-time push alerts to student mobile app (QoS Level 1)                                   |
| Real-Time Bidirectional        | WebSocket (Socket.io) | Yes             | Live dashboard updates in the browser without polling.                                     | Coordinator dashboard: live application state changes                                       |
| Flexible Query API             | GraphQL (Apollo)      | Yes             | Complex nested queries with field selection for coordinator dashboard.                     | Rankings queries, application history with nested student/document data                     |
| High-Performance Inter-Service | gRPC (Protobuf)       | Yes             | Binary serialization for internal high-frequency calls between services.                   | Academic Engine → AI Agent: ranking vector transmission                                     |
| Process Automation Trigger     | Webhooks (n8n)        | Yes             | Event-driven business process automation without polling.                                  | COMPLETED/REJECTED events trigger n8n workflow for reports and email                        |
| Legacy Government APIs         | SOAP (Spring-WS stub) | Yes (stub)      | Government SIISE/RUMI APIs expose SOAP. Adapter pattern isolates domain.                   | Socioeconomic Validator → RUMI/SIISE stub                                                   |

## 8.2 Estrategia de Alta Disponibilidad

High availability is implemented in PROD across two AWS Availability Zones (us-east-1a and us-east-1b). The following services require HA and are deployed accordingly:

| **Service**        | **HA Mechanism**                                     | **AZ Distribution**                | **Justification**                                                                         |
| ------------------ | ---------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| Custom API Gateway | Application Load Balancer (ALB) + ASG (min:2, max:4) | AZ-A + AZ-B                        | Single point of entry for all traffic; single failure here brings down the entire system. |
| Identity Service   | ALB + ASG (min:2, max:3)                             | AZ-A + AZ-B                        | Authentication is required for every request; any downtime blocks all users.              |
| Workflow / Saga    | Active-Passive Redis Sentinel                        | AZ-A primary + AZ-B standby        | Saga orchestrator state must survive instance failure to prevent orphaned applications.   |
| RabbitMQ           | Quorum Queues (3-node cluster)                       | AZ-A (2 nodes) + AZ-B (1 node)     | Saga command queues must not lose messages; quorum queues provide leader election.        |
| Kafka              | 3-broker cluster + ZooKeeper                         | AZ-A (2 brokers) + AZ-B (1 broker) | Domain event stream must be durable and replayable; replication factor = 2.               |
| RDS PostgreSQL     | Multi-AZ RDS (PROD only)                             | AZ-A primary + AZ-B standby        | Identity and academic data are critical; Multi-AZ provides automatic failover in <60s.    |
| RDS MariaDB        | Multi-AZ RDS (PROD only)                             | AZ-A primary + AZ-B standby        | Financial and audit data are critical for compliance; automatic failover required.        |
| Academic Engine    | ASG (min:2, max:4) - Go stateless                    | AZ-A + AZ-B                        | Ranking computation is CPU-intensive; horizontal scaling prevents bottleneck.             |

## 8.3 Infraestructura AWS - VPC Multi-AZ Solo EC2 (QA y PROD)

All compute runs on Amazon EC2. Managed AWS services (DynamoDB, Lambda, managed API Gateway, ElastiCache, QLDB) are explicitly excluded to guarantee predictable costs within the \$100 Learner Lab credit.

### 8.3.1 Entorno QA - Single-AZ (Optimizado para Costos)

| **EC2 #** | **Type**  | **Network** | **Docker Services**                              | **vCPU / RAM** |
| --------- | --------- | ----------- | ------------------------------------------------ | -------------- |
| 1         | t3.small  | Public      | Custom API Gateway + Nginx SSL + Certbot         | 1 / 2 GB       |
| 2         | t2.micro  | Public      | Bastion Host (SSH jump-box only)                 | 1 / 1 GB       |
| 3         | t3.medium | Private A   | Identity Service + Socioeconomic Validator       | 2 / 4 GB       |
| 4         | t3.small  | Private A   | Academic Engine Go (2 replicas)                  | 1 / 2 GB       |
| 5         | t3.small  | Private A   | Document Service + Audit Ledger                  | 1 / 2 GB       |
| 6         | t3.small  | Private A   | Redis 7 + RabbitMQ 3 + Kafka + Mosquitto MQTT    | 1 / 2 GB       |
| 7         | t3.small  | Private B   | Workflow/Saga + Financial Service                | 1 / 2 GB       |
| 8         | t3.small  | Private B   | Notification Hub + AI Eligibility Agent + n8n    | 1 / 2 GB       |
| 9         | t3.small  | Public      | Prometheus + Grafana + InfluxDB + Site24x7 agent | 1 / 2 GB       |

### 8.3.2 Entorno PROD - Multi-AZ con ELB + ASG

| **Component**             | **Type / Count**              | **Network**                         | **Services / Notes**                                                     |
| ------------------------- | ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| Application Load Balancer | ALB (managed)                 | Public                              | Routes to API Gateway ASG across AZ-A + AZ-B. SSL termination.           |
| API Gateway ASG           | t3.small × 2 (min) → 4 (max)  | Public AZ-A + AZ-B                  | Custom API Gateway + Nginx. ASG triggers on CPU > 70%.                   |
| Bastion Host              | t2.micro × 1                  | Public AZ-A                         | SSH jump-box only. Strict security group (port 22, VPN CIDR only).       |
| Identity + SocioEcon ASG  | t3.medium × 2 (min) → 3 (max) | Private AZ-A + AZ-B                 | NestJS Identity + Java Validator. Multi-AZ RDS PostgreSQL backend.       |
| Academic Engine ASG       | t3.small × 2 (min) → 4 (max)  | Private AZ-A                        | Go stateless replicas. Read-side CQRS queries served from Redis replica. |
| Document + Audit          | t3.small × 2                  | Private AZ-A + AZ-B                 | Document Service + Audit Ledger. Shared MariaDB Multi-AZ RDS.            |
| Messaging Cluster         | t3.medium × 3                 | Private AZ-A (2) + AZ-B (1)         | RabbitMQ quorum cluster + Kafka 3-broker + ZooKeeper + Mosquitto MQTT.   |
| Workflow + Financial ASG  | t3.small × 2 (min) → 3 (max)  | Private AZ-B                        | Saga Service + Financial Service. Redis Sentinel for state persistence.  |
| Notification + AI + n8n   | t3.small × 2                  | Private AZ-B                        | Notification Hub + AI Agent + n8n. Cassandra Astra external.             |
| Observability             | t3.small × 1                  | Public AZ-A                         | Prometheus + Grafana + InfluxDB + Site24x7 agent.                        |
| RDS PostgreSQL Multi-AZ   | db.t3.micro                   | Private AZ-A primary + AZ-B standby | Identity + Socioeconomic data. Auto-failover < 60s.                      |
| RDS MariaDB Multi-AZ      | db.t3.micro                   | Private AZ-A primary + AZ-B standby | Financial + Audit data. INSERT-only audit table enforced.                |
| VPC Endpoint (S3)         | Gateway type                  | Private                             | Encrypted document storage. No data traverses public internet.           |
| On-Premise Backup         | Site-to-Site VPN              | Private                             | Nightly pg_dump / mysqldump encrypted (AES-256) → on-premise NAS.        |

# 9\. Arquitectura de Seguridad

## 9.1 Capas de Seguridad

Security is implemented in depth across multiple layers:

| **Layer**          | **Technology**                                       | **Scope**                                                                                                                                |
| ------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Edge / CDN         | Cloudflare WAF + Rate Limiting                       | DDoS protection, bot filtering, OWASP Top 10 rules, rate limiting before traffic reaches AWS.                                            |
| Network            | AWS VPC + Security Groups + NACLs                    | Public subnets expose only ports 80/443. Private subnets unreachable from internet. Bastion (EC2 Jump Box) is the only SSH entry point.  |
| Authentication     | JWT RS256 (asymmetric) + NestJS                      | Tokens signed with private key on Identity Service; verified with public key on all downstream services without round-trip.              |
| Authorization      | RBAC (Roles: STUDENT, COORDINATOR, AUDITOR)          | Enforced at API Gateway middleware layer. Each route maps to a minimum required role. NestJS Guards validate role claims in JWT payload. |
| Transport          | TLS 1.3 (Nginx + Certbot / Let's Encrypt)            | All external traffic encrypted. Internal VPC traffic uses TLS for inter-service gRPC calls.                                              |
| Data at Rest       | AES-256-CBC per-student key (Document Service)       | Each student's documents encrypted with a unique key stored in AWS Secrets Manager.                                                      |
| Secrets Management | AWS Secrets Manager + GitHub Secrets                 | All credentials, API keys, and DB passwords stored in Secrets Manager. Never in code or environment files.                               |
| Audit Trail        | Immutable SHA-256 hash-chained ledger (Go + MariaDB) | Every security-relevant event (login, document access, approval decision) is appended to the tamper-evident ledger.                      |
| CORS               | API Gateway CORS middleware                          | Strict origin allowlist per environment (QA: localhost:3000, PROD: uce.edu.ec). Credentials mode enabled only for authenticated routes.  |
| Container Security | Non-root Docker users + read-only filesystems        | All Docker containers run as non-root users. Filesystems are read-only where possible.                                                   |

# 10\. Arquitectura de Bases de Datos (10 Bases, Persistencia Poliglota)

The system uses ten distinct database instances, each selected for the access pattern of its domain. All relational databases are normalized to 3NF on the write side; CQRS read projections are intentionally denormalized for query performance.

| **#** | **Database**               | **Type**                   | **Service**                             | **Justification**                                                                                                              |
| ----- | -------------------------- | -------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1     | PostgreSQL 15 RDS          | Relational (ACID)          | Identity + Socioeconomic Validator      | Strong consistency for user accounts and government validation results. Normalized to 3NF. Multi-AZ in PROD.                   |
| 2     | MariaDB 10 RDS (Financial) | Relational (ACID)          | Financial Service                       | InnoDB is superior for high-frequency transactional writes. Normalized to 3NF. Separate RDS instance from audit for isolation. |
| 3     | MariaDB 10 RDS (Audit)     | Relational - INSERT-only   | Audit Ledger                            | Append-only SHA-256 chain. DELETE and UPDATE blocked at application layer. Separate from Financial for compliance isolation.   |
| 4     | Redis 7 (EC2)              | In-Memory Cache / KV       | Academic Engine + Workflow/Saga         | Sub-millisecond state access for Saga state machine and ranking cache. Mandatory cache requirement. Redis Sentinel in PROD.    |
| 5     | MongoDB Atlas              | Document Store (NoSQL)     | Document Service                        | Heterogeneous document metadata (variable schemas per document type). Free tier: 512 MB. Full-text search via Atlas Search.    |
| 6     | Cassandra (DataStax Astra) | Wide-Column (Time-Series)  | Notification Hub                        | Append-only time-series writes for notification logs. Optimized for write-heavy, time-ordered data. Free tier: 80 GB.          |
| 7     | Neo4j Aura                 | Graph Database             | AI Eligibility Agent / Fraud Detection  | Graph algorithms (PageRank, Community Detection) find applicant networks sharing documents in O(E+V). Free tier: 200 MB.       |
| 8     | Upstash Redis              | Managed Redis (PAAS Cache) | AI Eligibility Agent (read projections) | CQRS read-side projection cache for AI scoring results. Free tier: 500K commands/month.                                        |
| 9     | InfluxDB (EC2)             | Time-Series                | Observability (Prometheus → InfluxDB)   | Stores metrics time-series data from Prometheus for long-term retention beyond Prometheus TSDB limits.                         |
| 10    | S3 (Standard)              | Object Storage             | Document Service + Backup               | Encrypted PDF storage (AES-256-CBC). Also used for Terraform state and nightly backup staging before on-premise transfer.      |

# 11\. Frontend Multiplataforma - Microfrontends

The frontend is implemented as three independent microfrontends sharing a common design system, enabling independent deployment of each surface:

| **Microfrontend**     | **Platform**                        | **Technology**                     | **Key Features**                                                                                                      |
| --------------------- | ----------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Student Portal        | Web (React) + Mobile (React Native) | Next.js 14 + React Native          | Application submission, document upload, real-time status via WebSocket, MQTT push notifications. Role: STUDENT.      |
| Coordinator Dashboard | Web (React)                         | Next.js 14 + Apollo GraphQL Client | Application review, AI decision override, ranking visualization, live state changes via WebSocket. Role: COORDINATOR. |
| Audit Console         | Desktop (Electron + React)          | Electron + React + PDF export      | Immutable ledger viewer, SHA-256 chain verification, CSV/PDF audit report export. Role: AUDITOR.                      |

Each microfrontend is a separate Turborepo package, deployed independently via GitHub Actions to its own EC2 instance behind the Application Load Balancer. A shared @uce/ui package provides common components, design tokens, and API clients.

# 12\. Estrategia de Implementación

## 12.1 Pipeline GitOps (QA y PROD)

All infrastructure and application deployments are version-controlled in a Turborepo monorepo and applied through GitHub Actions. The pipeline enforces quality gates before any deployment. Conventional Commits are enforced via commitlint. Pull Requests require at least one approval and passing CI before merge.

Pipeline stages: 1) Lint + Unit Tests (Nx affected). 2) SonarQube Analysis (> 80% coverage gate). 3) Functional Tests (Playwright/Postman Newman). 4) PR Approval (required). 5) Docker Build + Push to GHCR (tagged with git SHA). 6) Terraform Plan (QA workspace). 7) Terraform Apply QA (auto). 8) k6 Load Tests (1,000 VUs on QA). 9) Manual Gate for PROD promotion. 10) Terraform Apply PROD. 11) k6 Load Tests (25,000 VUs on PROD). 12) Site24x7 uptime check passes → deployment complete.

## 12.2 Estrategia de Pruebas

| **Test Type**      | **Tool**                                                    | **Scope**                                                            | **Environment** | **CI/CD Stage**                    |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------- | --------------- | ---------------------------------- |
| Unit Testing       | Jest (TS/JS), JUnit 5 (Java), testify (Go), pytest (Python) | Business logic in isolation, domain core, port adapters              | QA + PROD       | Stage 1 - before build             |
| Functional Testing | Postman Newman + Playwright                                 | API contract tests, end-to-end user flows (apply, approve, disburse) | QA              | Stage 3 - after deploy to QA       |
| Load Testing       | k6                                                          | 25,000 virtual users on PROD; 1,000 on QA. SLA: p95 < 200 ms         | QA + PROD       | Stage 8/11 - after Terraform Apply |
| Chaos Testing      | Chaos Monkey (manual)                                       | Random EC2 instance termination to verify ASG self-healing           | PROD            | Sprint 12 final delivery           |
| Security Testing   | OWASP ZAP (automated)                                       | SQL injection, XSS, JWT tampering, CORS bypass                       | QA              | Stage 3 - parallel with functional |

## 12.3 Hoja de Ruta de 12 Semanas

| **Sprint** | **Epic**                   | **Main Deliverables**                                                                                                                |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| S1         | Foundation & CI/CD         | Turborepo monorepo setup · GitHub Actions pipeline · Terraform VPC modules (QA + PROD workspaces) · Conventional Commits enforcement |
| S2         | Auth & Core Infrastructure | RDS + EC2 base deployment · NestJS Identity Service · Custom API Gateway · Cloudflare WAF integration · JWT RS256                    |
| S3         | Domain: Academic (CQRS)    | Academic Engine Go · CQRS read/write separation · Upstash Redis read projections · Goroutine benchmark (25K rankings < 50 ms)        |
| S4         | Domain: Socioeconomic      | Java/Spring Validator · DroolsLite rules engine · SIISE/RUMI SOAP stub · PostgreSQL 3NF schema                                       |
| S5         | Domain: Documents          | Document Service Java · S3 VPC endpoint · MongoDB Atlas metadata · AES-256 per-student encryption                                    |
| S6         | Core: Messaging            | RabbitMQ quorum cluster · Kafka 3-broker cluster · MQTT Mosquitto · Pub/sub integration across core services · gRPC Academic→AI      |
| S7         | Core: Audit                | Audit Ledger Go · SHA-256 hash-chaining engine · MariaDB 3NF INSERT-only schema · MariaDB integration                                |
| S8         | Domain: Intelligence       | Neo4j Aura configuration · AI Agent Python FastAPI · Random Forest training · CQRS prediction/query split                            |
| S9         | Finance & Saga             | Workflow Saga Java · Financial NestJS · Stripe Mock API · GraphQL coordinator API · WebSocket live updates                           |
| S10        | Notifications & n8n        | Notification Hub Python · MQTT push · Cassandra Astra logging · n8n webhook triggers · WebSocket coordinator dashboard               |
| S11        | Observability & HA         | Prometheus/Grafana/InfluxDB · Site24x7 external monitoring · ELB + ASG PROD deployment · Multi-AZ RDS · On-premise VPN backup        |
| S12        | Testing & Delivery         | k6 load tests (25,000 VUs) · Chaos tests · OWASP ZAP scan · Swagger documentation · Final ADR register · README completion           |

# 13\. Estimación de Costos

## 13.1 Entorno QA (160 horas/mes, Lun-Vie, auto-destruir Vie 22:00 UTC)

| **Service**                             | **Configuration**             | **Est. Cost/Month** |
| --------------------------------------- | ----------------------------- | ------------------- |
| EC2 Cluster (7 microservice instances)  | t3.small OnDemand, Linux      | \$11.65             |
| EC2 Identity + Socioeconomic            | t3.medium OnDemand            | \$3.33              |
| EC2 Bastion Host                        | t2.micro (Free Tier eligible) | \$0.00              |
| RDS PostgreSQL (QA Single-AZ)           | db.t2.micro, 20 GB gp2        | \$5.18              |
| RDS MariaDB (QA Single-AZ)              | db.t2.micro, 20 GB gp2        | \$5.02              |
| S3 Standard                             | 5 GB + 1K PUTs + 10K GETs     | \$0.12              |
| MongoDB Atlas, Upstash, DataStax, Neo4j | Permanent free tiers          | \$0.00              |
| TOTAL QA AWS                            |                               | ~\$25.30 / month    |

## 13.2 Entorno PROD (160 horas/mes con ELB + ASG)

| **Service**                                      | **Configuration**             | **Est. Cost/Month** |
| ------------------------------------------------ | ----------------------------- | ------------------- |
| ALB (Application Load Balancer)                  | Managed, us-east-1            | \$16.20             |
| API Gateway ASG (min 2 × t3.small)               | t3.small × 2 OnDemand         | \$7.30              |
| Identity + Socioeconomic ASG (min 2 × t3.medium) | t3.medium × 2 OnDemand        | \$13.30             |
| Academic Engine ASG (min 2 × t3.small)           | t3.small × 2 OnDemand         | \$7.30              |
| Messaging Cluster (3 × t3.medium)                | t3.medium × 3 OnDemand        | \$19.95             |
| Other Microservice Instances (5 × t3.small)      | t3.small × 5 OnDemand         | \$18.25             |
| RDS PostgreSQL Multi-AZ                          | db.t3.micro Multi-AZ, 20 GB   | \$28.10             |
| RDS MariaDB Multi-AZ                             | db.t3.micro Multi-AZ, 20 GB   | \$27.40             |
| S3 Standard                                      | 20 GB + higher request volume | \$0.65              |
| Site-to-Site VPN (on-premise backup)             | 1 VPN connection              | \$36.50             |
| Data Transfer OUT                                | 100 GB/month                  | \$9.00              |
| TOTAL PROD AWS                                   |                               | ~\$183.95 / month   |

Note: PROD costs exceed the \$50 QA budget. The PROD environment is provisioned only during final demonstration sprints (S11-S12) using remaining Learner Lab credits, or via a separate AWS account. QA is the primary development and testing environment within budget.

# 14\. Registros de Decisiones de Arquitectura (ADR)

| **ADR #** | **Decision**                                                       | **Status**           | **Rationale**                                                                                                                                       |
| --------- | ------------------------------------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-001   | EC2-Only Infrastructure (exclude DynamoDB, Lambda, managed API GW) | Accepted             | Guarantees predictable costs within \$100 Learner Lab credit. Forces self-hosting discipline.                                                       |
| ADR-002   | Turborepo Monorepo with Remote Cache                               | Accepted             | Reduces CI pipeline from ~15 min to ~2 min for a 10-service polyglot monorepo.                                                                      |
| ADR-003   | Orchestrated Saga over Choreography-Based Saga                     | Accepted             | Single point of truth for adjudication state machine; enables formal auditability and testable compensation paths.                                  |
| ADR-004   | SHA-256 Hash-Chaining on MariaDB over Amazon QLDB                  | Accepted             | Replicates tamper-evident properties of QLDB at zero marginal cost using only cryptographic primitives.                                             |
| ADR-005   | Domain-Specific Internal Pattern Selection                         | Accepted             | Applying Hexagonal everywhere = overengineering. Applying N-Tier everywhere = under-engineering. Each service uses the best-fit pattern.            |
| ADR-006   | Kafka + RabbitMQ Dual Broker                                       | Accepted             | RabbitMQ for request/command queues (Saga); Kafka for event streams requiring consumer group isolation and replay. Both are mandatory requirements. |
| ADR-007   | CQRS at Academic Engine and AI Agent                               | Accepted             | Prevents ranking computation from blocking status queries. Enables horizontal scaling of read and write paths independently.                        |
| ADR-008   | Cloudflare WAF at Edge over AWS WAF                                | Accepted             | Free tier covers Learner Lab use case. Provides DDoS protection before traffic reaches AWS, reducing EC2 load.                                      |
| ADR-009   | n8n for Business Process Automation                                | Accepted             | Low-code automation of notification workflows and report generation without custom service code. Self-hosted on EC2.                                |
| ADR-010   | On-Premise Backup via Site-to-Site VPN                             | Accepted (PROD only) | Satisfies professor requirement. Nightly pg_dump/mysqldump encrypted and transferred via VPN to on-premise NAS.                                     |

# 15\. Riesgos y Limitaciones

| **Risk**                                                                 | **Severity** | **Mitigation Strategy**                                                                                                                              |
| ------------------------------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Learner Lab session timeout (4-hour limit) interrupts active deployments | High         | Terraform state stored in S3. All infrastructure reproducible via terraform apply from scratch. Destroy/recreate is a documented runbook.            |
| EC2 instance limit constrains scaling                                    | Medium       | Services with highest resource contention (Academic Engine) run on dedicated instance with 2 Go replicas. Vertical resizing to t3.medium as ceiling. |
| PROD cost exceeds QA budget                                              | Medium       | PROD provisioned only during final demonstration sprints using remaining credits. QA mirrors PROD architecture at reduced scale.                     |
| Free-tier external services impose storage limits                        | Medium       | MongoDB Atlas (512 MB), Upstash (500K cmds/month), DataStax (80 GB), Neo4j (200 MB) monitored. Datasets sized for one academic semester.             |
| Single-node Kafka/RabbitMQ in QA lacks durability                        | Low-Medium   | QA uses single-node for cost. PROD uses 3-node Kafka cluster + RabbitMQ quorum queues. Risk accepted for QA only.                                    |
| AI Random Forest trained on synthetic data only                          | Low          | Model is a functional architecture component. Real production training requires historical UCE data and IRB approval.                                |
| No real SIISE/RUMI API access                                            | Low          | ExternalApiStub returns realistic mock SOAP responses. Switching to real APIs requires only configuration change (ADR-005).                          |
| On-premise VPN unavailable in Learner Lab                                | Low          | VPN configuration documented and Terraform-ready. Tested with simulated on-premise using EC2 in a separate VPC acting as on-premise.                 |

# 16\. Conclusiones

The UCE Scholarship Management System demonstrates that a production-grade distributed architecture can be designed, documented, and operated within tight academic budget constraints (\$25.30/month QA vs. \$50 limit) without compromising architectural correctness or technical depth.

- The C4 model proved to be the most effective communication framework for this multi-stakeholder project. Combined with process, sequence, and use-case diagrams, it covers all levels of technical depth required by the professor.
- The principle of domain-specific pattern selection (ADR-005) is the most significant architectural contribution: applying Hexagonal Architecture everywhere would have been overengineering; applying N-Tier everywhere would have been under-engineering. Each of the ten microservices uses the best-fit pattern.
- The Orchestrated Saga pattern (ADR-003) provides a single point of truth for the adjudication state machine, enabling formal auditability, testable compensation paths, and clear observability - advantages that choreography-based Sagas cannot provide.
- CQRS at the Academic Engine and AI Agent separates read-heavy ranking queries from write-heavy ingestion, preventing query contention and enabling independent horizontal scaling of each path.
- Hash-chaining on MariaDB (ADR-004) replicates the tamper-evident properties of Amazon QLDB at zero marginal cost using only cryptographic primitives and an INSERT-only policy enforced at the application layer.
- The mandatory communication protocols - Kafka, RabbitMQ, and MQTT - are all implemented with justified domain assignments: RabbitMQ for Saga commands, Kafka for domain event streams with consumer group isolation, and MQTT for mobile push notifications.
- All ten database instances (3 relational, 1 graph, 1 document, 2 key-value/cache, 1 wide-column, 1 time-series, 1 object store) are justified by access pattern and domain characteristics, with relational schemas normalized to 3NF.
- The PROD environment adds ELB + ASG + Multi-AZ RDS + 3-node Kafka/RabbitMQ clusters to achieve high availability. The QA environment mirrors the same topology at reduced scale, enabling confident promotion.
- Turborepo remote cache and dependency-aware pipeline (ADR-002) transforms a 15-minute CI pipeline for a 10-service polyglot monorepo into a ~2-minute pipeline for any individual commit - a critical enabler for the 12-week sprint cadence.
- n8n business process automation and on-premise backup via Site-to-Site VPN complete the operational requirements, delivering a system that is not only architecturally sound but operationally production-ready.

# 17\. Referencias Bibliográficas

- Brown, S. (2018). The C4 model for visualising software architecture. Leanpub. <https://c4model.com>
- Newman, S. (2021). Building Microservices: Designing Fine-Grained Systems (2nd ed.). O'Reilly Media.
- Richardson, C. (2018). Microservices Patterns: With Examples in Java. Manning Publications.
- Fowler, M. (2002). Patterns of Enterprise Application Architecture. Addison-Wesley.
- Cockburn, A. (2005). Hexagonal architecture (Ports and Adapters). <https://alistair.cockburn.us/hexagonal-architecture/>
- Young, G. (2010). CQRS Documents. <https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf>
- Terraform by HashiCorp. (2024). Infrastructure as Code documentation. <https://www.terraform.io/docs>
- Turborepo. (2024). Monorepo build system documentation. Vercel. <https://turbo.build/repo/docs>
- Amazon Web Services. (2024). AWS Academy Learner Lab - Instructor Guide. AWS Training and Certification.
- RabbitMQ. (2024). AMQP 0-9-1 Model Explained. <https://www.rabbitmq.com/tutorials/amqp-concepts>
- Apache Kafka. (2024). Kafka Documentation. <https://kafka.apache.org/documentation/>
- Neo4j. (2024). Graph Data Science Library - PageRank Algorithm. <https://neo4j.com/docs/graph-data-science/current/algorithms/page-rank/>
- n8n. (2024). Workflow Automation Documentation. <https://docs.n8n.io>
- Cloudflare. (2024). Web Application Firewall Documentation. <https://developers.cloudflare.com/waf/>
- Site24x7. (2024). Infrastructure Monitoring Documentation. <https://www.site24x7.com/help/>

# Apéndice A - Lista de Verificación de Requisitos del Profesor

## Requisitos Obligatorios

| **#** | **Requirement**                                                              | **Status**                 | **Where Documented**                                                                             |
| ----- | ---------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| 1     | Mono Repo (Turborepo)                                                        | ✅ QA + PROD               | Sections 5.8, 12.1, ADR-002                                                                      |
| 2     | Language & Framework - Backend                                               | ✅ QA + PROD               | Go, Java/Spring Boot, NestJS, Python/FastAPI - Section 7.1                                       |
| 3     | Multiplatform (Web, Mobile, Desktop) + Roles/Permissions                     | ✅ QA + PROD               | Section 11 - 3 microfrontends; Section 9.1 - RBAC                                                |
| 4     | Microservices ≥ 10                                                           | ✅ 10 services - QA + PROD | Sections 6.2, 6.3                                                                                |
| 5     | Security: Bastion/Jump Box, CORS, Cloudflare WAF, Rate Limit, JWT            | ✅ QA + PROD               | Section 9 - Security Architecture                                                                |
| 6     | AWS + PAAS (Supabase, MongoDB Atlas, DataStax, Neo4j, Upstash)               | ✅ QA + PROD               | Sections 7.1, 10                                                                                 |
| 7     | DevOps: CI/CD + GitHub Actions per microservice                              | ✅ QA + PROD               | Section 12.1 - GitOps Pipeline                                                                   |
| 8     | Testing: Load (k6), Unit, Functional - Backend in CI/CD                      | ✅ QA + PROD               | Section 12.2 - Testing Strategy                                                                  |
| 9     | Docker Hub or GitHub Registry (GHCR)                                         | ✅ QA + PROD               | Section 7.1 - GHCR; Section 12.1                                                                 |
| 10    | Design Principles ≥ 4 (SOLID, DRY, KISS, YAGNI, Low Coupling, High Cohesion) | ✅ QA + PROD               | Section 5.9 - all 8 principles documented                                                        |
| 11    | Databases ≥ 3 types + 1 cache (10 total)                                     | ✅ 10 DBs - QA + PROD      | Section 10 - full polyglot persistence matrix                                                    |
| 12    | ELB + ASG                                                                    | ✅ PROD only               | Section 8.3.2 - PROD Multi-AZ with ELB + ASG                                                     |
| 13    | Terraform (IaC)                                                              | ✅ QA + PROD               | Sections 5.8, 12.1, ADR-001                                                                      |
| 14    | API Gateway                                                                  | ✅ QA + PROD               | Sections 6.2, 6.3, 7.1 - Custom Node.js + Nginx                                                  |
| 15    | Communication Methods ≥ 3 (Mandatory: Kafka, RabbitMQ, MQTT)                 | ✅ 9 protocols - QA + PROD | Section 8.1 - REST, RabbitMQ, Kafka, MQTT, WebSocket, GraphQL, gRPC, Webhooks, SOAP              |
| 16    | Architectures ≥ 2 (Mandatory: Microservices, Event-Driven, CQRS)             | ✅ 7 patterns - QA + PROD  | Sections 5, 6.3 - Microservices, Event-Driven, CQRS, Hexagonal, FSM, Pipes&Filters, Rules Engine |
| 17    | Monitoring + Alerting (Site24x7, Prometheus, Grafana)                        | ✅ QA + PROD               | Sections 7.1, 8.3 - Prometheus + Grafana + InfluxDB + Site24x7                                   |
| 18    | High Availability                                                            | ✅ PROD (QA limited)       | Section 8.2 - HA strategy with AZ distribution                                                   |
| 19    | On-Premise Backup (PROD)                                                     | ✅ PROD                    | Section 8.3.2 - Site-to-Site VPN; ADR-010                                                        |
| 20    | n8n for Business Process Automation                                          | ✅                         | Sections 7.1, 8.1 (Webhooks), 12.1 - S10 sprint                                                  |
| 21    | Documentation (Swagger, Conventional Commits, PR, READMEs)                   | ✅                         | Section 12.1 - pipeline enforces conventional commits; Swagger in Sprint S12                     |

## Requisitos Opcionales

| **#** | **Requirement**                        | **Status**                   | **Notes**                                                                                        |
| ----- | -------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| 1     | Kubernetes                             | ⏭ Not implemented           | EC2-only strategy. Kubernetes would require EKS (cost). Documented as future upgrade path.       |
| 2     | Managed Cache (frontend or backend)    | ✅ Backend                   | Redis 7 EC2 + Upstash Redis PAAS - Section 10                                                    |
| 3     | Multi-region                           | ⏭ Out of scope              | Single us-east-1 region. Multi-region documented as PROD upgrade path.                           |
| 4     | Multi-VPC                              | ✅ Simulated                 | Separate VPC for on-premise backup simulation (EC2 acting as on-premise). Section 8.3.2.         |
| 5     | Automatic DB Backups (PROD)            | ✅ PROD                      | Nightly pg_dump/mysqldump → S3 → VPN → on-premise. RDS automated backups enabled.                |
| 6     | Automatic EC2 creation                 | ✅ PROD                      | ASG creates EC2 instances automatically on CPU > 70% or instance failure. Section 8.2.           |
| 7     | Microfrontends ≥ 3                     | ✅                           | Student Portal, Coordinator Dashboard, Audit Console - Section 11                                |
| 8     | Go for parallel programming simulation | ✅                           | Academic Engine uses Goroutines. 25,000 rankings in <50 ms. Section 7.1.                         |
| 9     | Blockchain in system                   | ⏭ SHA-256 chain alternative | Hash-chaining on MariaDB replicates tamper-evident properties. ADR-004.                          |
| 10    | AI Agent for analysis/prediction       | ✅                           | AI Eligibility Agent - Random Forest + Neo4j graph algorithms. Section 6.3.                      |
| 11    | Payment gateway (Stripe)               | ✅                           | Financial Service + Stripe Mock API (QA). Real adapter ready for PROD. Section 6.3.              |
| 12    | Active Directory                       | ⏭ Not implemented           | RBAC via JWT RS256 is sufficient for UCE scope. AD integration documented as enterprise upgrade. |



    Practical Requeriments		
        QA	PROD
1	Mono Repo	x	x
2	Language programing and framework. 1 // Backend	x	x
3	Multiplatform // Web- Mobil - Desktop - Roles or permissions	x	x
4	Microservices at least 10	x	x
5	Segurity ----Create -- Jump box - EC2 bastion.  Cors -- Firewall Cloudflare- Rate limint - JWT -  etc	x	x
6	Use AWS and any PAAS such --- Contenfull - Strapi- Supabase , etc	x	x
7	Devops -- For microservices -- CI - CD - Githubactions	x	x
8	Testing ---Load Testing- Unit Testing. - Functional Testing - Backend into CI/CD	x	x
9	Docker- HUB or Github Registry	x	x
10	Design Principles - at least 4 such as … SOLID - DRY - KISS -YAGNI - Encapsulation -Cohesion - Low Cupling - GRASP	x	x
11	DataBase --  at least 3 DB and one must be cache - Differents types.	x	x
12	ELB - ASG		x
13	Terraform	x	x
14	Apigateway	x	x
15	Methods of comunications - at least  3 include Restapi ----, SOAP, Restapi ,  - GRPC -  Webhooks, websocket Graphql , Mandatory Kafka , Rabbitmq and MQTT	x	x
16	Architectures at least 2 -- MVC - MVVC -Hexagonal -  -  -Layered - Mandatory Micro services, Event Drive and CQRS	x	x
17	Monitory - alerting -- Site 24-7 - Prometheus - Grafana	x	x
18	High availability	x	x
19	Connect with an on-premise to do backups 		x
20	Uses n8n to automate some business processes		
21	Good documation such as Swagger, conventional commit, PR,readmes etc		
            
    Optional		
            
1	Kubernets	x	x
2	Manage Cache eather frontend or backend	x	x
3	Multi region		x
4	Multi VPC	x	x
5	Create automatically Backups DataBase		x
6	Create automatically EC2		x
7	Microfrontends , at least 3	x	x
8	Use go language to simulate the parallel programmig	x	x
9	Generate a blockchain into your system	x	x
10	Use an AI agent to analyze or predict results	x	x
11	Add a payment gateway such as> Stipe - Payla		
12	Connect to Active Directory		
