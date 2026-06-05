# Student Portal

## Overview
The Student Portal is the primary client-facing web application for scholarship applicants. It provides a secure, intuitive interface for users to submit applications, monitor evaluation statuses, and interact with the Central University of Ecuador's scholarship systems.

## Architecture & Design
* **Server-Side Rendering (SSR)**: Built with Next.js to provide optimized initial load times and robust SEO capabilities.
* **API Proxying**: Implements native Next.js rewrites (`next.config.mjs`) to securely proxy `/api/*` requests to the internal API Gateway, avoiding CORS complexity and abstracting backend topology from the client browser.
* **Styling**: Utilizes Tailwind CSS for responsive, accessible, and maintainable user interface components.

## Technology Stack
* **Framework**: Next.js (React)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Build Tool**: Turbopack

## Configuration
The portal relies on the following essential environment variables:
* `NEXT_PUBLIC_API_URL`: The fully qualified URL of the target API Gateway. This is evaluated during the build process to bake the routing rules into the production assets.
