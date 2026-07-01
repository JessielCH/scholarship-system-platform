# Academic Engine

## Overview
The Academic Engine is a highly performant Go-based microservice that calculates and evaluates a student's academic metrics (GPA, credits, faculty rules) against scholarship requirements.

## Technology Stack
- **Language**: Go 1.21+
- **Architecture**: Domain-Driven Design (DDD)
- **Concurrency**: Goroutines for parallel rule evaluation
- **Messaging**: Apache Kafka

## Implementation Details
- Defines domain models in `internal/domain`.
- Subscribes to Kafka topics (e.g. `student-academic-update`) to trigger recalculations.
- Exposes fast gRPC/REST endpoints for synchronous validation.
- Extensive benchmarking and unit testing in `benchmarks/` and `tests/`.

## Setup & Local Development
1. **Prerequisites**: Go 1.21+
2. **Fetch Dependencies**:
   ```bash
   go mod download
   ```
3. **Run locally**:
   ```bash
   go run cmd/main.go
   ```
4. **Run tests & benchmarks**:
   ```bash
   go test ./...
   go test -bench=. ./benchmarks/...
   ```

## Build & Deployment
Compiled into a lightweight native binary (`academic-engine.exe` for local Windows, ELF for Linux). Dockerized using a multi-stage `scratch` or `alpine` image and deployed to the `core` EC2 node.
