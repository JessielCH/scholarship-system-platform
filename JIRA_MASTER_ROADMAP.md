# 🗺️ JIRA MASTER ROADMAP: UCE Scholarship System

This is your definitive map. It explicitly structures what goes into each Sprint, which Epics are involved, and **where exactly your Confluence link belongs**. Use this as your final guide to copy and paste into your Jira board.

---

## 📅 SPRINT 1: Infrastructure and Architecture (CLOSED)
**Dates:** 18/May/26 to 01/Jun/26
**Goal:** Establish the base architecture, repositories, and network infrastructure.

### 🏗️ EPIC 1: Base Infrastructure and CI/CD
*   **[Task] Design Formal System Architecture**
    *   **[Subtask]** Write formal architecture report and patterns.
    *   **[Subtask]** Draw PlantUML diagrams in Confluence.
    *   🔗 **ATTACH LINK HERE:** `https://jessieljosue.atlassian.net/wiki/x/AYCr` 👈 *(This is exactly where your link goes!)*
*   **[Task] Initialize Turborepo Monorepo**
    *   **[Subtask]** Run `npx create-turbo` in the root directory.
    *   **[Subtask]** Configure `Husky` and `Commitlint`.
*   **[Task] Deploy Base Network with Terraform**
    *   **[Subtask]** Create VPC and Subnets in AWS.
    *   **[Subtask]** Configure GitHub Actions pipelines.

### 🛡️ EPIC 2: API Gateway (Microservice 1)
*   **[Story] As a system, I need a unified entry point.**
    *   **[Subtask]** Initialize Node.js/Express.
    *   **[Subtask]** Configure Rate Limiting against DDoS.

---

## 📅 SPRINT 2: Security and Student Domain (CLOSED)
**Dates:** 01/Jun/26 to 15/Jun/26
**Goal:** Implement asymmetric authentication and document service.

### 🔐 EPIC 3: Identity Service (Microservice 2)
*   **[Story] As a user, I want to authenticate to receive my token.**
    *   **[Subtask]** Initialize NestJS and PostgreSQL.
    *   **[Subtask]** Logic for JWT RS256 signing.

### 📄 EPIC 4: Document Service (Microservice 3)
*   **[Story] As a student, I need to upload my PDFs to the system.**
    *   **[Subtask]** Configure Spring Boot and MongoDB.
    *   **[Subtask]** Encrypt PDFs in AWS S3.

---

## 📅 SPRINT 3: Business Logic and Rules (CLOSED)
**Dates:** 15/Jun/26 to 29/Jun/26
**Goal:** Implement socioeconomic validation and academic engine in Go.

### ⚖️ EPIC 5: Socioeconomic Validator (Microservice 4)
*   **[Story] As a coordinator, I need to validate RUMI rules automatically.**
    *   **[Subtask]** Configure DroolsLite Rules Engine (Java).
    *   **[Subtask]** Connect to Government SOAP Stub.

### 🧠 EPIC 6: Academic Engine (Microservice 5)
*   **[Story] As a system, I need to process rankings in <50ms (CQRS).**
    *   **[Subtask]** Write engine in Go (Goroutines).
    *   **[Subtask]** Implement Redis cache.

---

## 📅 SPRINT 4: Asynchronous Orchestration (ACTIVE - IN PROGRESS)
**Dates:** 29/Jun/26 to 13/Jul/26
**Goal:** Implement Saga Pattern, payments, and event bus. *(This is the sprint you are working on today!)*

### 🔄 EPIC 7: Workflow Saga (Microservice 6)
*   **[Story] As an orchestrator, I need to manage the scholarship state machine.**
    *   **[Subtask]** Deploy RabbitMQ.
    *   **[Subtask]** Implement automatic rollback if payment fails.

### 💳 EPIC 8: Payment Service (Microservice 7)
*   **[Story] As a system, I need to disburse funds to approved students.**
    *   **[Subtask]** Connect to Stripe API (Mock Mode).

### 📨 EPIC 9: Event Bus & Brokers
*   **[Task] Deploy Apache Kafka Cluster**
    *   **[Subtask]** Configure domain event topics.

---

## 📅 SPRINT 5: Audit, AI, and Notifications (FUTURE - BACKLOG)
**Dates:** 13/Jul/26 to 27/Jul/26
**Goal:** Add risk predictions (Machine Learning) and immutable ledgers.

### 🛡️ EPIC 10: Audit Ledger (Microservice 8)
*   **[Story] As an auditor, I require an immutable record of decisions.**
    *   **[Subtask]** Create SHA-256 cryptographic chain in Go/MariaDB.

### 🤖 EPIC 11: AI Eligibility Agent (Microservice 9)
*   **[Story] As a system, I need to predict fraud or dropout risk.**
    *   **[Subtask]** Create API in Python FastAPI.
    *   **[Subtask]** Train Random Forest model with Neo4j.

### 🔔 EPIC 12: Notification Hub (Microservice 10)
*   **[Story] As a student, I want push alerts on my phone.**
    *   **[Subtask]** Deploy Mosquitto MQTT.

---

## 📅 SPRINT 6: Stress Testing and Prod Release (FUTURE - BACKLOG)
**Dates:** 27/Jul/26 to 10/Aug/26
**Goal:** Destructive tests (k6) with 25,000 users and AWS High Availability.

### 🚀 EPIC 13: Testing and Ops (QA)
*   **[Task] Massive Load Simulation (k6)**
    *   **[Subtask]** 25,000 VUs attack on API Gateway.
*   **[Task] Multi-AZ Auto Scaling**
    *   **[Subtask]** Configure Load Balancer (ELB) and Auto Scaling Group (ASG).
