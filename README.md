# 🍽️ RestroOps AI Monorepo

## Overview
RestroOps is an AI-powered enterprise platform built for the restaurant industry. Leveraging a modern monorepo architecture, it provides an end-to-end ecosystem including an Admin Web Portal, a Restaurant Owner Dashboard, and a cross-platform Mobile App, all connected through a secure API Gateway.

## ✨ Features
- **Multi-Tenant System**: Dedicated applications for internal super-admins and restaurant owners.
- **Shared Codebase**: Centralized packages for database schemas, authentication, and observability.
- **Unified Gateway**: Fastify-powered API gateway for secure routing and data aggregation.
- **Containerized Scale**: Infrastructure as code utilizing Docker, Redis, Postgres, and LocalStack.

## 🛠️ Tech Stack
- **Frontend**: Next.js, React Native (Expo)
- **Backend**: Fastify, PostgreSQL, Redis, LocalStack
- **Tooling**: Turborepo, Docker

## 🚀 Installation & Usage
1. **Clone the repository**:
   ```bash
   git clone https://github.com/godnix7/RestoOPs.git
   cd RestoOPs
   ```
2. **Start Infrastructure**:
   ```bash
   docker compose up -d
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run Development Environment**:
   ```bash
   npm run dev
   ```
   - API Gateway: `http://localhost:3001`
   - Owner Dashboard: `http://localhost:3000`
   - Admin Dashboard: `http://localhost:3002`

## 🔮 Future Improvements
- Integration of AI agents for automated inventory forecasting.
- Real-time order tracking and kitchen display system (KDS) module.
