# Identity Service

## Overview
The Identity Service handles authentication, authorization, and user profile management for the Scholarship System Platform. It acts as the central authority for user identity verification.

## Technology Stack
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (via TypeORM)
- **Caching**: Redis
- **Messaging**: RabbitMQ (`amqplib`) / Apache Kafka
- **Authentication**: JWT, bcryptjs

## Implementation Details
- Issues JWT tokens for session management.
- Validates credentials against a PostgreSQL database.
- Publishes user lifecycle events (e.g., `UserCreated`) to RabbitMQ/Kafka for downstream services to consume asynchronously.
- Utilizes Redis for fast session retrieval and token blacklisting.

## Setup & Local Development
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Copy `.env.example` to `.env` and set `DB_HOST`, `REDIS_HOST`, and `RABBITMQ_URL`.
3. **Run locally**:
   ```bash
   npm run start:dev
   ```
4. **Run Tests**:
   ```bash
   npm run test
   ```

## Build & Deployment
Dockerized and deployed as a core microservice into the `security` or `core` EC2 nodes. Requires active connections to the dedicated `database` node (Postgres/Redis) and `broker` node (RabbitMQ).
