# API Gateway Service

## Overview
The API Gateway acts as the central ingress point for the Scholarship System Platform. It provides strict security controls, traffic shaping, and intelligent request routing to internal microservices.

## Key Responsibilities
* **Rate Limiting**: Enforces IP-based request quotas via Redis to mitigate Denial of Service (DoS) attacks and abuse.
* **Authentication Verification**: Validates asymmetric JWT tokens (RS256) at the edge before routing requests to protected upstream services.
* **Request Routing**: Proxies HTTP requests to internal microservices (e.g., Identity Service, Academic Engine) based on defined path mappings.
* **CORS Management**: Enforces strict Cross-Origin Resource Sharing policies to prevent unauthorized web client access.

## Technology Stack
* **Runtime**: Node.js
* **Framework**: Fastify
* **Cache/Storage**: Redis (ioredis)

## Configuration
The service relies on the following essential environment variables:
* `PORT`: The port on which the gateway listens (default: 3000).
* `REDIS_URL`: The connection string for the rate-limiting Redis instance.
* `JWT_PUBLIC_KEY`: The RS256 public key utilized for token signature verification.
* `IDENTITY_SERVICE_URL`: The internal network address of the Identity Service.
