# Admin Portal

## Overview
The Admin Portal is the secure, internal-facing administrative dashboard utilized by Central University of Ecuador Coordinators and Staff. It facilitates the review, adjudication, and auditing of scholarship applications.

## Key Features
* **Application Review**: Interface for evaluating student documentation and socioeconomic metrics.
* **AI Override**: Capabilities to review and manually override automated Fraud Detection AI decisions.
* **Audit Dashboard**: Read-only visualization of the immutable, hash-chained ledger events for compliance tracking.

## Technology Stack
* **Framework**: Next.js (React)
* **Language**: TypeScript
* **Styling**: Tailwind CSS

## Configuration
The portal relies on the following essential environment variables:
* `NEXT_PUBLIC_API_URL`: The fully qualified URL of the internal API Gateway routing endpoint.
