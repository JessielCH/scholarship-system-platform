# Identity Service

## Overview
The Identity Service manages core user accounts, authentication lifecycles, and authorization role bindings for the Scholarship System Platform. It functions as the central authority for identity verification.

## Key Responsibilities
* **User Management**: Handles user registration, profile management, and credential storage.
* **Authentication**: Provides login endpoints and issues RS256-signed JSON Web Tokens (JWT).
* **Cryptography**: Utilizes asymmetric cryptography to sign tokens, enabling decentralized token verification across the microservices ecosystem without persistent network calls.
* **Database Management**: Manages the core relational schemas for identities using TypeORM and PostgreSQL.

## Technology Stack
* **Runtime**: Node.js
* **Framework**: NestJS
* **Database**: PostgreSQL (via TypeORM)
* **Security**: bcryptjs for password hashing, jsonwebtoken for RS256 asymmetric signatures.

## Configuration
The service relies on the following essential environment variables:
* `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection parameters.
* `JWT_PRIVATE_KEY`: The RS256 private key utilized for token generation.
* `JWT_PUBLIC_KEY`: The RS256 public key.
* `JWT_EXPIRATION`: Token validity duration (e.g., '1h').
