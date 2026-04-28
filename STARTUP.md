# 🚀 RestroOps AI Startup Guide

Follow these steps to get the platform up and running in your local environment.

## 1. Prerequisites
- **Docker Desktop**: Required for Postgres, Redis, and LocalStack.
- **Node.js 20+**: Recommended version.
- **Turbo CLI**: `npm install -g turbo`.

## 2. Infrastructure Setup
Spin up the database and supporting services:
```powershell
docker-compose up -d
```

## 3. Database Preparation
Run the migrations to set up the schema and MFA support:
```powershell
./scripts/migrate.ps1
```

## 4. Install Dependencies
Ensure all workspace packages are linked:
```powershell
npm install
```

## 5. Launch Development Servers
Start all services (API Gateway, Owner Dashboard, Admin Portal) simultaneously:
```powershell
npm run dev
```

## 6. Accessing the Platform
- **Owner Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:3001](http://localhost:3001)
- **Admin Portal**: [http://localhost:3002](http://localhost:3002)

## 7. Initial Login
You can seed the database with test data using the provided seed script if needed, or simply sign up via the Owner Dashboard.

---
### 🛠️ Troubleshooting
- **CSS Errors**: Ensure you are using a modern browser. The dashboard uses Tailwind v4 which requires up-to-date CSS support.
- **Database Connection**: If the API fails to start, verify that the `DATABASE_URL` in `services/api-gateway/.env` matches the credentials in `docker-compose.yml`.
