# Document Service

## Overview
The Document Service is a Java-based microservice responsible for handling document uploads, storage metadata, and retrieval. It manages student files such as IDs, transcripts, and financial records for scholarship applications.

## Technology Stack
- **Language**: Java 21
- **Framework**: Spring Boot (Maven)
- **Containerization**: Docker (Eclipse Temurin)

## Implementation Details
- Exposes RESTful endpoints for secure file uploads and downloads.
- Validates file types and sizes.
- Integrates with AWS S3 (or local volume storage depending on the environment) to persist binary data.

## Setup & Local Development
1. **Prerequisites**: Java 21, Maven 3.9+
2. **Build the project**:
   ```bash
   mvn clean install -DskipTests
   ```
3. **Run locally**:
   ```bash
   mvn spring-boot:run
   ```

## Build & Deployment
Packaged as a lightweight JAR file and containerized using a multi-stage Dockerfile. Deployed to the `core` EC2 node in AWS environments.
