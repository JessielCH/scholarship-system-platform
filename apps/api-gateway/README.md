# API Gateway

## Overview
The API Gateway is an Express.js-based entry point for the Scholarship System Platform. It routes incoming client requests to the appropriate backend microservices, acting as a reverse proxy, load balancer, and first line of defense for security and rate limiting.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Routing**: `http-proxy-middleware`
- **Testing**: Jest

## Implementation Details
- Exposes a unified API surface to frontend clients (`student-portal`).
- Handles CORS, request logging, and basic request validation.
- Routes `/api/identity/*` to the `identity-service`.
- Routes `/api/academic/*` to the `academic-engine`.
- Routes `/api/documents/*` to the `document-service`.

## Setup & Local Development
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Ensure `.env` contains routing targets (e.g., `IDENTITY_SERVICE_URL`).
3. **Run locally**:
   ```bash
   npm run dev
   ```
4. **Run Tests**:
   ```bash
   npm run test
   ```

## Build & Deployment
Included in the global monorepo build using Turborepo. Deployed via Docker into the `edge` EC2 node in the QA/Production environments.
