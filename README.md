# RestroOps AI Monorepo

## 🚀 Getting Started

### 1. Infrastructure
Ensure you have Docker installed and run:
```bash
docker compose up -d
```
This starts **Postgres (16)**, **Redis (7)**, and **LocalStack**.

### 2. Setup
Install dependencies from the root:
```bash
npm install
```

### 3. Database
Apply migrations to the Postgres container (or use a migration tool if configured).
The migrations are located in `packages/db/migrations/`.

### 4. Development
Start all services and apps in parallel:
```bash
npm run dev
```

### Services & Apps
- **API Gateway**: `http://localhost:3001`
- **Owner Dashboard**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3002`
- `apps/web-admin`: Next.js app for internal super admins.
- `apps/mobile`: Expo app for mobile users.
- `services/api-gateway`: Fastify gateway service.
- `packages/shared`: Shared types and validation schemas.
- `packages/auth`: JWT and authentication helpers.
- `packages/db`: Database schema, migrations, and seeds.
- `packages/observability`: Logging and monitoring wrappers.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Local Setup
1. Clone the repository.
2. Run `npm install` at the root.
3. Start the infrastructure services:
   ```bash
   docker-compose up -d
   ```
4. Run the development environment:
   ```bash
   npm run dev
   ```

## Development
This project uses **Turborepo** for task orchestration.
- `npm run build`: Build all apps and services.
- `npm run dev`: Start all apps and services in development mode.
- `npm run lint`: Lint all packages.
