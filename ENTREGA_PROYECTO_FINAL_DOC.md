# Final Project - Distributed Programming

**Project Name:** Scholarship System Platform
**Student Name:** Jessiel Chasiguano

---

## a. Project Repository
- **Repository Link:** https://github.com/JessielCH/scholarship-system-platform
- **Source Code:** Contains the implementation of the two core microservices: `api-gateway` and `identity-service`, organized in a monorepo structure.
- **Commit History:** A detailed and meaningful commit history is available on the `develop`, `QA`, and `main` branches, demonstrating the iterative process, branch protection, and GitOps workflow.
- **Technical README:** Included in the root of the repository, detailing the architecture, local setup instructions, and deployment commands.
- **Configuration Files:** The repository includes `docker-compose.yml` for local orchestration, `.github/workflows` for CI/CD pipelines, and `infrastructure/terraform` for Infrastructure as Code (IaC).
- **Environment Variables:** Documented safely. Sensitive credentials, passwords, and JWT private/public keys are explicitly excluded from the repository using `.gitignore` and are injected securely via GitHub Secrets during CI/CD.

---

## d. Minimum Technical Documentation

### 1. Overview of the Two Microservices
For this final project delivery, two core functional microservices of the distributed architecture have been implemented:
1. **API Gateway (Edge):** Built with Node.js and Fastify. It acts as the single entry point for external requests. It is responsible for routing requests to the appropriate internal microservices, implementing global rate limiting using Redis to prevent brute-force attacks, and validating JWT tokens (RS256) to ensure only authenticated users access protected internal routes.
2. **Identity Service:** Built with NestJS (TypeScript). A backend microservice responsible for handling user authentication and authorization. It manages identities, validates user credentials, generates secure JWT tokens, and maintains user state. It connects exclusively to a PostgreSQL database.

### 2. Functional Responsibility and Independence
- **Low Coupling and High Cohesion:** The microservices exhibit a clear separation of concerns. The *API Gateway* does not know how to validate passwords or query databases; its sole responsibility is to protect the internal network and route traffic efficiently. The *Identity Service* is not exposed directly to the internet; its responsibility is strictly executing authentication business logic and managing its data persistence layer.
- **Communication and Integration:** The API Gateway communicates with the Identity Service via internal HTTP/REST over a private Docker network (locally) or AWS VPC (in the cloud), demonstrating synchronous communication and functional integration between decoupled and independent services.

### 3. Technologies Used
- **Backend Frameworks:** Node.js, NestJS (Identity Service), Fastify (API Gateway).
- **Persistence & Caching:** PostgreSQL (Relational Data) and Redis (Caching & Rate Limiting).
- **Containerization:** Docker and Docker Compose.
- **Infrastructure as Code (IaC):** Terraform (AWS EC2, VPC, RDS, Security Groups).
- **CI/CD & DevOps:** GitHub Actions and GitHub Container Registry (GHCR).

### 4. Overall Solution Architecture
The solution is deployed on **Amazon Web Services (AWS)** using a distributed architecture isolated by Virtual Private Clouds (VPCs) and Security Groups. There are two physically separated environments replicated via Terraform: **QA** and **PRODUCTION**.
- **Network Differentiation:** QA uses the CIDR block `10.2.0.0/16`, while Production uses `10.3.0.0/16`. Both have public and private subnets across multiple Availability Zones to guarantee High Availability.
- **Security:** The API Gateway runs on an EC2 instance in a public subnet, acting as the edge server. The Identity Service connects to an AWS RDS PostgreSQL instance located in a private subnet, completely isolated from direct internet access.

### 5. Primary Endpoints
**API Gateway (Port 3000 - Public):**
- **POST** `/auth/login` (Proxies traffic to the Identity Service)
- **POST** `/auth/register` (Proxies traffic to the Identity Service)
*(Global rate limiting is enforced on all routes via Redis).*

**Identity Service (Port 3001 - Internal):**
- **POST** `/auth/login` (Validates credentials against PostgreSQL and issues JWT).
- **POST** `/auth/register` (Creates a user in the database).

### 6. Problems Found and Solutions Applied
- **AWS Learner Lab Limitations:** Deploying multiple infrastructure components via Terraform caused AWS to interrupt the process due to strict free-tier policy violations. **Solution:** Instance types were reduced to `t2.micro` and `db.t3.micro`, and residual resources were cleaned up to stay within budget limits.
- **Terraform State Loss in CI/CD:** GitHub Actions runners are ephemeral, which caused Terraform to lose its `.tfstate` file and attempt to recreate existing AWS resources (like VPCs and Subnet Groups), leading to duplication errors. **Solution:** An automated script was added to the GitHub Actions pipeline to create a unique S3 Bucket and dynamically configure an S3 Remote Backend, ensuring persistent state across automated deployments.

### 7. Technical Conclusions
The implementation successfully demonstrates the full lifecycle of modern distributed software development. It encompasses source code management in a monorepo, containerization with Docker, automated CI/CD pipelines for testing and delivery, and dynamic provisioning of isolated cloud infrastructure using Terraform. The architecture fully complies with the principles of distributed systems, separation of responsibilities, and robust deployment pipelines expected for the final delivery.

---

## b. Evidence of the QA Environment
*(NOTE: Please replace the placeholders below with the actual screenshots and links before submitting the document).*

- **QA Functional URL:** `http://<QA_EC2_PUBLIC_IP>:3000`
- **Postman Evidence:**
  - *[Insert Screenshot: Postman successfully hitting `POST /auth/login` and receiving a 201 Created with the JWT tokens]*
  - *[Insert Screenshot: Postman hitting a protected route without a token and receiving a 401 Unauthorized]*
- **Execution Logs:**
  - *[Insert Screenshot: Docker container logs or GitHub Actions deployment logs showing successful execution in QA]*

## c. Evidence of the PRODUCTION Environment
*(NOTE: Please replace the placeholders below with the actual screenshots and links before submitting the document).*

- **Production Functional URL:** `http://<PROD_EC2_PUBLIC_IP>:3000`
- **Differentiated Deployment Evidence:**
  - *[Insert Screenshot: AWS Console showing two separate VPCs (`10.2.0.0/16` for QA and `10.3.0.0/16` for PROD) and RDS instances]*
- **Postman Evidence:**
  - *[Insert Screenshot: Postman successfully executing functional tests against the Production IP, demonstrating stable behavior]*
