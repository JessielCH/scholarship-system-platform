# Student Portal

## Overview
The Student Portal is the primary frontend user interface for the Scholarship System Platform. It provides students with a seamless, responsive experience to apply for scholarships, upload documents, and track their application status.

## Technology Stack
- **Library**: React 19
- **Build Tool**: Vite (or Next.js)
- **Styling**: Vanilla CSS / Modules (Modern, premium aesthetics)
- **Routing**: React Router

## Implementation Details
- Single Page Application (SPA) communicating exclusively with the `api-gateway`.
- Implements secure JWT storage and authenticated routing.
- Designed with high-quality UX/UI, micro-animations, and responsive layouts.

## Setup & Local Development
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Set `VITE_API_GATEWAY_URL=http://localhost:3000` (or equivalent).
3. **Run locally**:
   ```bash
   npm run dev
   ```
4. **Build for production**:
   ```bash
   npm run build
   ```

## Build & Deployment
Served as static files via Nginx or integrated into a Node server on the `edge` EC2 instance, directly exposed to the internet.
