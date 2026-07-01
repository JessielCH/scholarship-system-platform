# Socioeconomic Validator

## Overview
The Socioeconomic Validator is a Java microservice designed to process and evaluate a student's socioeconomic data to determine their eligibility for various scholarship tiers.

## Technology Stack
- **Language**: Java 17
- **Framework**: Spring Boot (or standard Java depending on architecture)
- **Containerization**: Docker (Eclipse Temurin JRE)

## Implementation Details
- Consumes asynchronous events or REST requests containing student financial information.
- Applies business rules and scoring algorithms to calculate a "Vulnerability Score".
- Integrates with the `socioeconomic_db` database for historical record keeping.

## Setup & Local Development
1. **Prerequisites**: Java 17, Maven
2. **Build the project**:
   ```bash
   mvn clean package
   ```
3. **Run locally**:
   ```bash
   java -jar target/socioeconomic-validator-0.0.1-SNAPSHOT.jar
   ```

## Build & Deployment
Packaged into a fat JAR and deployed as a Docker container within the `core` EC2 instances.
