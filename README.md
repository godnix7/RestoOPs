# 🍽️ RestroOps AI
### AI-Powered Restaurant Back-Office & Management System

RestroOps AI is a professional-grade SaaS platform designed to revolutionize restaurant operations. By leveraging cutting-edge Artificial Intelligence and a robust modern tech stack, RestroOps automates the complex "back-of-house" tasks—from accounting and payroll to invoice processing and intelligent reporting.

---

## 🚀 Core Features

### 🔐 Enterprise-Grade Authentication
- **Multi-Factor Authentication (MFA):** Secure access for different staff levels.
- **Role-Based Access Control (RBAC):** Granular permissions for owners, managers, and staff.
- **JWT-based Sessions:** Secure and stateless authentication flow.

### 📄 Intelligent Invoice OCR
- **AWS Textract Integration:** Automatically extract data from physical and digital invoices.
- **Automated Accounting:** Seamlessly sync invoice data with your financial records.
- **Error Detection:** AI-driven validation to catch discrepancies in billing.

### 💰 Automated Payroll & Accounting
- **Payroll Calculation Engine:** Handles complex payroll runs based on hours, roles, and taxes.
- **Transaction Management:** Detailed tracking of every cent in and out.
- **Financial Reporting:** Real-time insights into the restaurant's financial health.

### 🤖 AI Agent Integration
- **LangGraph & Claude:** Powered by state-of-the-art LLMs for intelligent query handling and automation.
- **Automated Workflows:** Intelligent routing of tasks and data across the system.

---

## 🛠️ Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (React) |
| **Backend API** | [Fastify](https://www.fastify.io/) (Node.js) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Caching** | [Redis](https://redis.io/) |
| **AI Framework** | [LangGraph](https://langchain-ai.github.io/langgraph/) |
| **LLM** | [Claude 3](https://www.anthropic.com/claude) |
| **Infrastructure** | [AWS Textract](https://aws.amazon.com/textract/) |

---

## 📊 Database Architecture

The system utilizes a relational PostgreSQL schema optimized for performance and scalability:

- **Organizations & Restaurants:** Multi-tenant support for chains and independent outlets.
- **Transactions:** High-integrity ledger for all financial movements.
- **Payroll Runs:** Specialized tables for historical and pending payroll data.
- **Row-Level Security (RLS):** Built-in data isolation at the database level via Supabase.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL (Supabase recommended)
- Redis instance

### Installation
```bash
# Clone the repository
git clone https://github.com/godnix7/RestoOPs.git

# Navigate to the project
cd RestroOPS

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run the development server
npm run dev
```

---

## 📄 License
This project is proprietary. All rights reserved.

---
*Built with ❤️ for the restaurant industry by [godnix7](https://github.com/godnix7)*
