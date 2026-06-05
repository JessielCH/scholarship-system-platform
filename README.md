# Scholarship System Platform

## Overview
The Scholarship System Platform is a distributed, microservices-based application designed to manage scholarship adjudications, processing, and life-cycle management. It leverages a polyglot architecture with event-driven design principles to ensure scalability, fault tolerance, and security across the entire ecosystem.

## Architecture
The system is composed of several independent services communicating via synchronous APIs and asynchronous event brokers.

### Core Microservices
* **API Gateway (`apps/api-gateway`)**: The centralized entry point for all client requests. It handles rate limiting, request validation, and intelligent routing.
* **Identity Service (`apps/identity-service`)**: Manages authentication, authorization, and user identity lifecycles utilizing RS256 asymmetric JWT signing.
* **Student Portal (`apps/student-portal`)**: A frontend application built with Next.js acting as the primary interface for applicants.
* **Admin Portal (`apps/admin-portal`)**: Administrative dashboard for application review and status management.

### Infrastructure & Operations
* **Containerization**: All services are containerized using Docker.
* **Orchestration**: Docker Compose is utilized for local development and edge deployment orchestration.
* **CI/CD Pipeline**: Automated deployment processes are enforced through GitHub Actions, ensuring consistent and reproducible builds across environments.

## Getting Started

### Prerequisites
* Node.js (v20 or higher)
* Docker & Docker Compose
* Git

### Local Environment Setup
1. Clone the repository.
2. Install monorepo dependencies:
   ```bash
   npm install
   ```
3. Initialize the infrastructure services (databases, brokers) using Docker Compose:
   ```bash
   docker compose up -d postgres redis
   ```
4. Start the required microservices.

## Security Posture
The platform enforces strict security controls:
* Edge-level protection via rate limiting.
* Network isolation using Virtual Private Clouds (VPC).
* Asymmetric token signing for stateless authentication verification.
* Principle of least privilege enforced across all database connections and internal service communications.

## License
Confidential and Proprietary. All rights reserved.