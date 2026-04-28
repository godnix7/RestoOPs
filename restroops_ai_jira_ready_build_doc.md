# RestroOps AI — JIRA‑Ready Build Plan (FINAL Production Build Document) v1.0
**Date:** 2026-04-28  
**This is the single source-of-truth build document** for creating Epics/Stories/Subtasks in Jira.  
It includes **everything**: roles, platform differences, UI behaviors (every button/modal), backend endpoints, DB/RLS, admin privileges, policies (editable by admin), CI/CD, observability, security no‑bypass, restaurant operational needs, QA gates.

---

## 1) How to Create Jira from This Document
### 1.1 Issue Types & Conventions
- **Epic**: `ROPS-E#` (you will map to Jira epics)
- **Story**: `ROPS-S#`
- **Sub-task**: `ROPS-T#`
- **Bug**: standard Jira bug issue type
- **Spike** (optional): research/prototyping tasks

### 1.2 Labels (Use consistently)
- `backend`, `api-gateway`, `db`, `rls`, `redis`, `bullmq`, `ai`, `langgraph`, `web-owner`, `web-admin`, `mobile`
- `security`, `auth`, `billing`, `reporting`, `integrations`, `notifications`, `observability`, `ci-cd`, `infra`
- `e2e`, `integration-test`, `unit-test`, `performance`, `compliance`

### 1.3 Definition of Done (Applies to EVERY story)
A story is **Done** only if:
1. API enforces JWT + RBAC + restaurant scope checks (if applicable)
2. Postgres RLS enforced + tested for all tenant-scoped tables
3. Audit log written for all mutations (insert into `audit_log`)
4. UI includes: loading + error + empty + retry states
5. All destructive actions use **in-app modal** (no browser confirm)
6. Observability: structured logs + Sentry + Datadog tags include `request_id`, `user_id`, `restaurant_id` (where relevant)
7. Tests added per story:
   - unit tests for pure logic
   - integration tests for endpoints and RLS
   - e2e tests for critical flows
8. Security: no secrets in client; sensitive fields encrypted; file access via presigned URLs only
9. Documentation updated if public behavior changed (routes, env vars, runbooks)

---

## 2) Global System Requirements (Non-Negotiable)
### 2.1 Roles & Platforms
Roles:
- **Super Admin** (internal): Web Admin only
- **Operations Manager** (internal): Web Admin only
- **AI Agent** (automated): backend service identity only
- **Owner** (client): Web Owner + Mobile
- **Manager** (client staff): Mobile (limited web)
- **Advisor/Accountant** (client external): Web (read-only)

### 2.2 “No Bypass” Security Rules (Hard acceptance for every feature)
- Every protected endpoint must reject:
  - missing/invalid JWT (401)
  - expired JWT (401)
  - denylisted JWT `jti` (401)
- RBAC must return **403** for wrong role even if UI hides feature
- Restaurant scope must return **403** if `restaurant_id` not in JWT `restaurant_ids` (or internal assignment)
- RLS must be enabled and tested (cannot rely on app checks)
- AI cannot execute money movement directly; must produce action cards requiring Owner approval
- Policies acceptance gate must block all app usage until accepted (except auth/policy endpoints)

### 2.3 Token & Session Specs (Must match across apps)
- Access JWT: HS256, **15 minutes**
- Refresh token: **7 days**, rotate on each refresh; store hashed in Redis
- MFA temp token: **5 minutes**
- Logout: add access `jti` to Redis denylist until access token expiry
- Frontend storage:
  - access token in memory only
  - refresh token in httpOnly cookie (web) and secure storage / cookie strategy for mobile (decision ticket included)

### 2.4 UI/UX Global Requirements
- No browser popups. Use:
  - Web: shadcn/ui dialogs/drawers/toasts
  - Mobile: RN modals/bottom sheets/snackbars
- Every button must have defined:
  - enabled/disabled rules
  - loading state
  - success result
  - error handling + retry
- Every entity lifecycle must include:
  - Create + View + Edit + Archive/Delete (+ Restore if needed)
  - Bulk actions where list supports it
  - Audit trail visibility (role-appropriate)

### 2.5 Restaurant Operational Needs to Include (Fits product)
- Labor % of Sales KPI
- Prime Cost KPI (COGS + Labor)
- Tip tracking + allocation reporting (payroll)
- Vendor price variance alerts
- Bank reconciliation / discrepancy resolution
- Compliance calendar by state (deadlines + reminders)

---

## 3) Jira Epics, Stories, Subtasks (BUILD ORDER)
> Build order is intentional: foundation → auth/security → data/RLS → core modules → admin → AI → reporting → integrations → polish.

---

# EPIC ROPS-E01 — Monorepo Foundation + Environments + DevEx
**Goal:** A working monorepo with consistent tooling, local dev, shared packages, and baseline service skeletons.

## ROPS-S01.1 — Create monorepo structure (apps/services/packages)
**Labels:** `infra`, `web-owner`, `web-admin`, `mobile`, `backend`  
**Acceptance Criteria**
- Repository contains baseline directories and build scripts
- `lint`, `typecheck`, `test`, `build` run successfully in CI

**Subtasks**
- ROPS-T01.1.1 Create `apps/web-owner` Next.js scaffold
- ROPS-T01.1.2 Create `apps/web-admin` Next.js scaffold
- ROPS-T01.1.3 Create `apps/mobile` Expo scaffold
- ROPS-T01.1.4 Create service skeletons (Fastify gateway + core services)
- ROPS-T01.1.5 Create `packages/shared` (types + zod)
- ROPS-T01.1.6 Create `packages/auth` (JWT helpers)
- ROPS-T01.1.7 Create `packages/db` (migrations + RLS)
- ROPS-T01.1.8 Create `packages/observability` (pino + sentry + dd wrappers)

## ROPS-S01.2 — Local dev environment (Docker compose)
**Labels:** `infra`  
**Acceptance Criteria**
- One command starts Postgres, Redis, local S3 (LocalStack) and runs apps/services

**Subtasks**
- ROPS-T01.2.1 Docker compose for Postgres + Redis + LocalStack S3
- ROPS-T01.2.2 Seed scripts for demo org/restaurant/users
- ROPS-T01.2.3 Local env docs + required env vars list

---

# EPIC ROPS-E02 — CI/CD Pipelines + Release Governance (Production)
**Goal:** PR checks, staging deploy, production blue/green with rollback, IaC pipeline.

## ROPS-S02.1 — PR checks workflow
**Labels:** `ci-cd`, `security`, `unit-test`  
**Acceptance Criteria**
- PR fails on lint/type/test/build/security scan failures

**Subtasks**
- ROPS-T02.1.1 Add GitHub Actions: lint + typecheck
- ROPS-T02.1.2 Add unit tests runner + coverage gate (configurable)
- ROPS-T02.1.3 Add build jobs (Next + services)
- ROPS-T02.1.4 Add Snyk scan (or placeholder if license pending)
- ROPS-T02.1.5 Add container build validation job

## ROPS-S02.2 — Staging deploy on merge
**Labels:** `ci-cd`, `infra`  
**Acceptance Criteria**
- Merge triggers: build+push images → deploy ECS staging → smoke tests

**Subtasks**
- ROPS-T02.2.1 Build+push to ECR
- ROPS-T02.2.2 Deploy ECS staging
- ROPS-T02.2.3 Smoke test script (health + auth + dashboard)

## ROPS-S02.3 — Production release pipeline (manual gate + rollback)
**Labels:** `ci-cd`, `infra`, `observability`  
**Acceptance Criteria**
- Manual approval required; rollback documented and functional

**Subtasks**
- ROPS-T02.3.1 Blue/Green deploy setup for ECS
- ROPS-T02.3.2 Automated rollback conditions + runbook
- ROPS-T02.3.3 Sentry release creation
- ROPS-T02.3.4 Datadog deployment markers

## ROPS-S02.4 — IaC pipeline (Terraform/Terragrunt)
**Labels:** `infra`, `ci-cd`  
**Acceptance Criteria**
- PR produces plan; merge can apply with approvals

**Subtasks**
- ROPS-T02.4.1 Terraform plan workflow
- ROPS-T02.4.2 Terraform apply workflow w/ approvals
- ROPS-T02.4.3 Secrets: GitHub OIDC to AWS

---

# EPIC ROPS-E03 — Authentication, Sessions, MFA, Policy Acceptance Gate (No Bypass)
**Goal:** Production auth for all apps, with MFA and policy acceptance enforcement.

## ROPS-S03.1 — Auth: POST /auth/login
**Labels:** `backend`, `auth`, `redis`, `security`  
**Acceptance Criteria**
- 200 success with tokens
- 401 invalid creds
- 429 after 5 fails/15 min
- MFA users return `mfa_required:true` + temp_token (5 min)

**Subtasks**
- ROPS-T03.1.1 bcrypt compare + user lookup
- ROPS-T03.1.2 Redis failed attempts counter + lockout
- ROPS-T03.1.3 JWT issue access token (15m) with required claims
- ROPS-T03.1.4 Issue refresh token (7d) + store hash in Redis

## ROPS-S03.2 — Auth: POST /auth/mfa/verify
**Labels:** `backend`, `auth`, `security`  
**Acceptance Criteria**
- Validates temp_token exp=5m
- OTP required; wrong OTP 401

**Subtasks**
- ROPS-T03.2.1 TOTP verify + encrypted secret fetch
- ROPS-T03.2.2 Access+refresh issue on success
- ROPS-T03.2.3 Audit log for MFA events (optional but recommended)

## ROPS-S03.3 — Auth: POST /auth/refresh (rotate)
**Labels:** `backend`, `auth`, `redis`  
**Acceptance Criteria**
- Rotates refresh; old refresh cannot be replayed

**Subtasks**
- ROPS-T03.3.1 Validate refresh cookie/token
- ROPS-T03.3.2 Rotate + revoke old hash
- ROPS-T03.3.3 Issue new access token

## ROPS-S03.4 — Auth: POST /auth/logout (denylist jti)
**Labels:** `backend`, `auth`, `redis`  
**Acceptance Criteria**
- Token denylisted; protected calls fail with 401

**Subtasks**
- ROPS-T03.4.1 Add `jti` to denylist until exp
- ROPS-T03.4.2 Revoke refresh hashes
- ROPS-T03.4.3 Clear cookies

## ROPS-S03.5 — Forgot password + reset password
**Labels:** `backend`, `auth`, `security`  
**Acceptance Criteria**
- OTP one-time, expires, rate-limited

**Subtasks**
- ROPS-T03.5.1 Send reset OTP (SES)
- ROPS-T03.5.2 Verify OTP + set new password
- ROPS-T03.5.3 Rate limit reset endpoints

## ROPS-S03.6 — API Gateway JWT middleware + RBAC + restaurant scope guard
**Labels:** `api-gateway`, `security`  
**Acceptance Criteria**
- 401 invalid/expired/denylisted
- 403 wrong role
- 403 wrong restaurant scope

**Subtasks**
- ROPS-T03.6.1 JWT verify + context attach
- ROPS-T03.6.2 Denylist check
- ROPS-T03.6.3 RBAC guard utility
- ROPS-T03.6.4 Restaurant scope validation utility

## ROPS-S03.7 — Policy management (Terms/Privacy/etc) admin-editable + forced acceptance
**Labels:** `web-admin`, `backend`, `db`, `security`  
**Policy Types (must implement all):**
- Terms of Service
- Privacy Policy
- Cookie Policy (web)
- Data Processing Addendum (DPA)
- Acceptable Use Policy

**Acceptance Criteria**
- Published versions immutable
- Users forced to accept latest at next login
- API blocks all non-policy routes until acceptance

**Subtasks**
- ROPS-T03.7.1 DB tables `policies`, `policy_acceptances`
- ROPS-T03.7.2 API: get current policy by type
- ROPS-T03.7.3 API: admin create draft/edit/preview/publish
- ROPS-T03.7.4 API: accept policy + record IP/user-agent
- ROPS-T03.7.5 Middleware: acceptance gate enforcement
- ROPS-T03.7.6 Admin UI: markdown editor + preview + diff + publish modal
- ROPS-T03.7.7 User UI: acceptance screen (web-owner, web-admin, mobile)

## ROPS-S03.8 — Session UX (all apps)
**Labels:** `web-owner`, `web-admin`, `mobile`, `auth`  
**Acceptance Criteria**
- Session timeout modal appears at T-2min
- “Stay signed in” triggers refresh
- Refresh fail forces re-login

**Subtasks**
- ROPS-T03.8.1 Web: session timer + modal
- ROPS-T03.8.2 Mobile: session timer + modal
- ROPS-T03.8.3 Standard error messaging + toasts

## ROPS-S03.9 — Decision story: Mobile refresh token strategy
**Labels:** `mobile`, `auth`, `security`  
**Acceptance Criteria**
- Documented approach with threat model; implemented consistently

**Subtasks**
- ROPS-T03.9.1 Option A: cookie-based via embedded web auth
- ROPS-T03.9.2 Option B: secure storage refresh token
- ROPS-T03.9.3 Choose + implement + test

---

# EPIC ROPS-E04 — Database, RLS, Audit Log, Encryption (Foundation)
**Goal:** All tables, RLS, indexes, audit insert-only, encryption for sensitive columns.

## ROPS-S04.1 — Create schema migrations (all tables)
**Labels:** `db`, `rls`  
**Acceptance Criteria**
- All tables from design exist + constraints + timestamps + soft delete fields
- Indexes implemented (design + required additions)

**Subtasks**
- ROPS-T04.1.1 Create `organizations`, `restaurants`, `users`
- ROPS-T04.1.2 Create `transactions` (+ unique dedupe)
- ROPS-T04.1.3 Create payroll tables
- ROPS-T04.1.4 Create vendors/invoices
- ROPS-T04.1.5 Create compliance tables
- ROPS-T04.1.6 Create AI tables (exceptions/messages/feedback)
- ROPS-T04.1.7 Create `audit_log` insert-only

## ROPS-S04.2 — Implement Supabase RLS policies (all tenant tables)
**Labels:** `db`, `rls`, `security`  
**Acceptance Criteria**
- Owner cannot read/write outside their restaurants
- Advisor cannot mutate any data
- Audit_log cannot be updated/deleted

**Subtasks**
- ROPS-T04.2.1 Enable RLS on each table
- ROPS-T04.2.2 Policy templates for `restaurant_id` scoping
- ROPS-T04.2.3 Internal staff assigned accounts policy
- ROPS-T04.2.4 Automated RLS test suite

## ROPS-S04.3 — Sensitive column encryption
**Labels:** `db`, `security`  
**Acceptance Criteria**
- `bank_details`, `tax_id`, `mfa_secret`, `pos_credentials` encrypted at rest

**Subtasks**
- ROPS-T04.3.1 Encryption library strategy (KMS/pgcrypto/app-layer)
- ROPS-T04.3.2 Implement encrypt/decrypt boundaries
- ROPS-T04.3.3 Tests for encryption

## ROPS-S04.4 — Audit log helper and enforcement
**Labels:** `backend`, `db`, `security`  
**Acceptance Criteria**
- Every mutation path writes audit log with before/after

**Subtasks**
- ROPS-T04.4.1 Shared audit helper
- ROPS-T04.4.2 Enforce usage in services (lint rule or code review checklist)
- ROPS-T04.4.3 Audit log viewer endpoint (admin)

---

# EPIC ROPS-E05 — Owner & Manager Dashboards (Web + Mobile)
**Goal:** Fully functional dashboards with caching and role variants.

## ROPS-S05.1 — Dashboard summary API + Redis caching
**Labels:** `backend`, `redis`, `performance`  
**Acceptance Criteria**
- Redis key `dashboard:{restaurant_id}:{period}` TTL 5m
- Cache invalidated on new transaction or payroll status change
- p95 < 200ms cached

**Subtasks**
- ROPS-T05.1.1 Implement aggregator queries
- ROPS-T05.1.2 Redis caching wrapper
- ROPS-T05.1.3 Invalidation triggers

## ROPS-S05.2 — Web Owner dashboard UI (every widget + behaviors)
**Labels:** `web-owner`, `ui`  
**Widgets & Buttons (must implement all exactly):**
- Weekly P&L card → click navigates to `/accounting/pl` with filter
- Payroll status banner → click navigates to `/payroll/current`
- Cash flow sparkline → click `/accounting/cash-flow`
- AI insights list:
  - button **Dismiss** opens confirm modal → DELETE `/ai/insights/:id`
  - button **Explain** opens drawer with reasoning
- Quick Actions:
  - **Log Sale** opens modal → creates manual transaction (revenue)
  - **Submit Expense** opens modal → creates manual transaction (expense)
  - **Message Agent** navigates to AI chat
- Vendor payments due widget → click opens invoice/vendor details
- Staff on shift counter → click opens staff list (owner+manager only)

**Acceptance Criteria**
- Each widget has loading/error/empty state
- No browser popups; use app modals/drawers
- Role enforcement: manager sees limited version

**Subtasks**
- ROPS-T05.2.1 Layout + skeletons
- ROPS-T05.2.2 Quick action modals
- ROPS-T05.2.3 Insights drawer + dismiss confirm
- ROPS-T05.2.4 Navigation + URL filter wiring

## ROPS-S05.3 — Mobile dashboard UI (compressed)
**Labels:** `mobile`, `ui`  
**Acceptance Criteria**
- Same data, mobile layout with bottom sheets
- Fast load + offline-friendly caching of last fetch

**Subtasks**
- ROPS-T05.3.1 Mobile cards layout
- ROPS-T05.3.2 Bottom sheets for detail
- ROPS-T05.3.3 Local cache (last dashboard snapshot)

## ROPS-S05.4 — Manager dashboard variant
**Labels:** `mobile`, `web-owner`  
**Acceptance Criteria**
- Manager sees operational KPIs only
- No payroll approval, no billing, no admin functions

**Subtasks**
- ROPS-T05.4.1 Role-based widget gating
- ROPS-T05.4.2 Manager-specific empty states and CTAs

---

# EPIC ROPS-E06 — Payroll Module (Draft → Approve → Export) + Anomalies + Realtime
**Goal:** Payroll end-to-end with approvals, manager edits, anomalies, audit trail, workers.

## ROPS-S06.1 — Payroll APIs (core endpoints)
**Labels:** `backend`, `bullmq`, `db`, `security`
Endpoints:
- GET `/payroll/runs/current` (Owner, Advisor read-only)
- GET `/payroll/runs` (Owner, Advisor)
- PUT `/payroll/line-items/:id` (Manager, Ops Manager)
- POST `/payroll/runs/:id/approve` (Owner; Ops override)
- POST `/payroll/runs/:id/reject` (Owner)
- POST `/payroll/runs/draft` (AI Agent service token only)

**Acceptance Criteria**
- Approve verifies totals within ±$0.01
- State transitions audited
- Worker job idempotent

**Subtasks**
- ROPS-T06.1.1 Run fetching queries with RLS
- ROPS-T06.1.2 Line item edit + recalc + audit
- ROPS-T06.1.3 Approve + enqueue export job
- ROPS-T06.1.4 Reject with mandatory comment
- ROPS-T06.1.5 Draft trigger auth via service token

## ROPS-S06.2 — Payroll anomaly detection + exceptions
**Labels:** `backend`, `ai`, `db`
Rules:
- hours > 60/week
- pay variance > 30% vs prior period
- zero hours for active employee

**Acceptance Criteria**
- Anomalies create `ai_exceptions` entries for admin queue
- Owner UI shows anomaly badge and explanation drawer

**Subtasks**
- ROPS-T06.2.1 Implement anomaly rules
- ROPS-T06.2.2 Store anomaly payload
- ROPS-T06.2.3 Link anomaly to UI explanation

## ROPS-S06.3 — Payroll UI (Web Owner + Mobile) detailed behavior
**Labels:** `web-owner`, `mobile`, `ui`
UI components:
- Pay period selector
- Employee table (hours/rate/gross/net/deductions)
- Anomaly badge per row opens drawer/sheet
- Buttons:
  - **Approve All** → confirm modal (checkbox required)
  - **Approve Selected** → confirm modal
  - **Reject + Comment** → modal with required comment
  - **Edit Hours** (Manager/Ops only) → modal form
- Status timeline chips: draft→pending→approved→processing→completed/rejected

**Acceptance Criteria**
- Buttons hidden by role AND API denies unauthorized actions
- Confirm modals are in-app, not browser
- Disabled state while submitting, prevents double-click
- Toasts on success/failure with retry

**Subtasks**
- ROPS-T06.3.1 Web table + drawers + modals
- ROPS-T06.3.2 Mobile list + bottom sheets + modals
- ROPS-T06.3.3 Realtime status subscription

## ROPS-S06.4 — Worker + webhooks for processor export
**Labels:** `bullmq`, `backend`, `integrations`
**Acceptance Criteria**
- Job retry safe
- Webhook updates run status, audited

**Subtasks**
- ROPS-T06.4.1 BullMQ queue + worker
- ROPS-T06.4.2 Webhook endpoint
- ROPS-T06.4.3 Idempotency keys + dedupe

---

# EPIC ROPS-E07 — Accounting & Bookkeeping (Transactions, P&L, Cashflow, Reconciliation)
**Goal:** Bank feed ingestion, categorization pipeline, transaction UI, P&L caching, reconciliation.

## ROPS-S07.1 — Plaid webhook ingestion + dedupe
**Labels:** `integrations`, `backend`, `db`
**Acceptance Criteria**
- Unique `(source, source_reference)` prevents duplicates
- Failed ingestion alerts ops (exception)

**Subtasks**
- ROPS-T07.1.1 Webhook endpoint
- ROPS-T07.1.2 Dedupe constraint handling
- ROPS-T07.1.3 Error → create ai_exception or ops ticket

## ROPS-S07.2 — AI categorization job + confidence threshold
**Labels:** `ai`, `bullmq`, `backend`
**Acceptance Criteria**
- Stores `category_confidence`
- confidence < 0.8 → creates exception

**Subtasks**
- ROPS-T07.2.1 Job definition + retry
- ROPS-T07.2.2 Prompt template + restaurant context
- ROPS-T07.2.3 Store results + exception creation

## ROPS-S07.3 — Transactions UI (Web Owner + Advisor read-only)
**Labels:** `web-owner`, `ui`
Buttons and behaviors:
- Transaction row click → opens detail drawer
- **Recategorize** (Owner only):
  - opens modal with category/subcategory dropdown
  - optional note
  - PUT endpoint
- **Add Manual Transaction** (Owner only):
  - opens modal form
  - POST endpoint
- Filters: date, category, source, reconciled, confidence
- Export CSV (Owner/Ops/Admin)

**Acceptance Criteria**
- Advisor sees no mutation buttons
- Audit log entries on recategorize/manual add

**Subtasks**
- ROPS-T07.3.1 List + filters + pagination
- ROPS-T07.3.2 Detail drawer + AI reasoning display
- ROPS-T07.3.3 Recategorize modal + success path
- ROPS-T07.3.4 Manual transaction modal

## ROPS-S07.4 — P&L API + Redis cache + UI
**Labels:** `backend`, `redis`, `web-owner`
**Acceptance Criteria**
- Cache invalidated on transaction changes
- Export PDF/CSV available by role rules

**Subtasks**
- ROPS-T07.4.1 Aggregation queries
- ROPS-T07.4.2 Cache wrapper + invalidation
- ROPS-T07.4.3 UI filters + export

## ROPS-S07.5 — Cashflow forecast + UI
**Labels:** `backend`, `web-owner`, `mobile`
**Acceptance Criteria**
- 30/60/90d projections and obligations integration

**Subtasks**
- ROPS-T07.5.1 Forecast calculation
- ROPS-T07.5.2 UI charts + “explain” panel

## ROPS-S07.6 — Reconciliation / discrepancy resolution (Restaurant need)
**Labels:** `backend`, `web-owner`
**Acceptance Criteria**
- Shows bank vs books; allows “mark resolved” with note (Owner/Ops)
- Audit logged

**Subtasks**
- ROPS-T07.6.1 Discrepancy detection logic
- ROPS-T07.6.2 UI list + investigation drawer
- ROPS-T07.6.3 Resolve action + audit

---

# EPIC ROPS-E08 — Vendors & Invoice Management (Upload, OCR, Approve, Dispute)
**Goal:** Vendors CRUD and invoice inbox with OCR pipeline; manager upload; owner approve/dispute.

## ROPS-S08.1 — Vendors CRUD (Owner)
**Labels:** `backend`, `web-owner`, `db`
Buttons:
- Add Vendor
- Edit Vendor
- Archive/Delete Vendor (confirm modal)
- View vendor detail

**Acceptance Criteria**
- Advisor read-only
- Audit logged for all mutations

**Subtasks**
- ROPS-T08.1.1 Vendors endpoints + RLS
- ROPS-T08.1.2 Web UI table + modals
- ROPS-T08.1.3 Archive flow

## ROPS-S08.2 — Invoice upload flow with S3 presigned URLs
**Labels:** `backend`, `web-owner`, `mobile`, `security`
**Acceptance Criteria**
- Validates file types + max 20MB
- Upload uses presigned PUT; access via presigned GET TTL 15m

**Subtasks**
- ROPS-T08.2.1 `/files/presign` endpoint
- ROPS-T08.2.2 Direct upload client implementation (web + mobile)
- ROPS-T08.2.3 `/files/confirm` endpoint and linking entity
- ROPS-T08.2.4 UI progress + error retry

## ROPS-S08.3 — Textract OCR worker + extracted_data storage
**Labels:** `bullmq`, `aws`, `backend`, `invoice`
**Acceptance Criteria**
- Stores vendor/date/line_items/total in JSONB
- OCR failures create exceptions

**Subtasks**
- ROPS-T08.3.1 BullMQ job `ocr_invoice`
- ROPS-T08.3.2 Textract AnalyzeDocument integration
- ROPS-T08.3.3 Parser + persistence
- ROPS-T08.3.4 Failure handling + exception

## ROPS-S08.4 — Invoice inbox UI (Web + Mobile)
**Labels:** `web-owner`, `mobile`, `ui`
Buttons:
- Upload invoice (Owner+Manager)
- View invoice detail
- Approve (Owner only)
- Dispute (Owner only)
- Pay now (Owner; Phase 2 if payments)
Statuses: New/Processing/Matched/Approved/Paid/Disputed

**Acceptance Criteria**
- Manager can upload but cannot approve/dispute
- All actions use in-app modals with confirmations

**Subtasks**
- ROPS-T08.4.1 Table/list UI + filters
- ROPS-T08.4.2 Invoice detail drawer/sheet
- ROPS-T08.4.3 Approve modal with payment date
- ROPS-T08.4.4 Dispute modal with reason + email preview/edit

## ROPS-S08.5 — Vendor price variance alerts (Restaurant need)
**Labels:** `backend`, `web-owner`, `ai`
**Acceptance Criteria**
- Detects unit price drift and displays inline alert
- Can “Flag to Ops” → creates exception ticket

**Subtasks**
- ROPS-T08.5.1 Price history tracking model
- ROPS-T08.5.2 Variance detection job
- ROPS-T08.5.3 UI inline alerts + flag action

---

# EPIC ROPS-E09 — AI Agent Chat (SSE), Action Cards, Escalation
**Goal:** Chat with restaurant context; action cards; escalation into admin queue.

## ROPS-S09.1 — AI Chat API (SSE streaming)
**Labels:** `ai`, `backend`, `langgraph`
**Acceptance Criteria**
- SSE streams token chunks
- Persists messages in `ai_agent_messages`
- Enforces rate limits

**Subtasks**
- ROPS-T09.1.1 SSE endpoint implementation
- ROPS-T09.1.2 DB persistence + session_id logic
- ROPS-T09.1.3 Rate limiting (30 msg/min user; 10 msg/min restaurant)

## ROPS-S09.2 — Tool calls + context retrieval (LangGraph)
**Labels:** `ai`, `langgraph`, `security`
Tools:
- get_transactions, get_payroll_summary, get_vendor_list, get_compliance_status

**Acceptance Criteria**
- Tool calls are scope-checked by restaurant_id
- No cross-tenant leakage

**Subtasks**
- ROPS-T09.2.1 Tool implementations with RBAC+RLS safe queries
- ROPS-T09.2.2 Pinecone namespace per restaurant
- ROPS-T09.2.3 LangSmith logging of prompts/tool calls

## ROPS-S09.3 — Action cards execution endpoint
**Labels:** `ai`, `backend`, `security`
**Acceptance Criteria**
- Owner-only for approvals or money-impact actions
- Confirm modal required on UI

**Subtasks**
- ROPS-T09.3.1 Action schema + validation
- ROPS-T09.3.2 Execute actions with audit logs

## ROPS-S09.4 — Escalation to Ops (creates ticket/exception)
**Labels:** `ai`, `web-owner`, `web-admin`
**Acceptance Criteria**
- Escalation creates queue item and notifies ops via email/slack webhook

**Subtasks**
- ROPS-T09.4.1 `/ai/chat/escalate` endpoint
- ROPS-T09.4.2 Notification integration
- ROPS-T09.4.3 UI escalation modal

## ROPS-S09.5 — Chat UIs (Web Owner + Mobile)
**Labels:** `web-owner`, `mobile`
Buttons:
- Send
- Attach (photo/PDF)
- Voice input
- Action card Approve/Dismiss/View details
- Escalate to Human

**Acceptance Criteria**
- Attachment upload uses S3 presign flow
- Voice uses transcription service (AWS Transcribe) or phased placeholder

**Subtasks**
- ROPS-T09.5.1 Web chat UI with streaming rendering
- ROPS-T09.5.2 Mobile chat UI with streaming rendering
- ROPS-T09.5.3 Attachments UI + validation
- ROPS-T09.5.4 Action cards UI components

---

# EPIC ROPS-E10 — Admin Exception Queue (Ops Manager + Super Admin)
**Goal:** Prioritized exception queue with SLA, assign/resolve/override/escalate, analytics.

## ROPS-S10.1 — Exception queue API + prioritization + SLA jobs
**Labels:** `backend`, `bullmq`, `db`
**Acceptance Criteria**
- Priority score = (1-ai_confidence) * urgency_weight * age_weight
- SLA timers:
  - payroll/compliance 4h
  - invoices 8h
- SLA jobs scheduled and visible

**Subtasks**
- ROPS-T10.1.1 Priority computation
- ROPS-T10.1.2 SLA delayed jobs in BullMQ
- ROPS-T10.1.3 API endpoints list/detail/assign/resolve/escalate/analytics

## ROPS-S10.2 — Admin web UI: queue list + detail panel
**Labels:** `web-admin`, `ui`
Buttons:
- Assign to me
- Resolve (accept AI / human override)
- Override AI (requires reason + corrected_value)
- Escalate to Senior
UI elements:
- SLA countdown color states
- Tabs: Summary / AI Reasoning / Source Data / Recommendation / Audit Preview / History

**Acceptance Criteria**
- Override requires dropdown reason and note
- All actions audited

**Subtasks**
- ROPS-T10.2.1 List view with filters/sorting
- ROPS-T10.2.2 Detail drawer/page
- ROPS-T10.2.3 Resolve modal + override form
- ROPS-T10.2.4 Analytics dashboard basic

---

# EPIC ROPS-E11 — Super Admin Console (Everything Privilege)
**Goal:** Global org/restaurant/user management, feature flags, AI config, impersonation, templates, audit logs.

## ROPS-S11.1 — Organizations management (CRUD + subscription status)
**Labels:** `web-admin`, `backend`, `billing`
Buttons:
- Create org
- Edit org
- Suspend/cancel org (confirm modal)
- Assign Ops Manager
- View billing status & Stripe IDs

**Acceptance Criteria**
- All changes audited and restricted to super_admin

**Subtasks**
- ROPS-T11.1.1 Org endpoints + UI
- ROPS-T11.1.2 Assign ops manager flow
- ROPS-T11.1.3 Billing view wiring (Stripe placeholders allowed)

## ROPS-S11.2 — Restaurants management (CRUD + state/timezone)
**Labels:** `web-admin`, `backend`, `db`
Buttons:
- Add restaurant to org
- Edit state/timezone/address
- Disable restaurant (confirm)

**Acceptance Criteria**
- Timezone used by payroll calculations

**Subtasks**
- ROPS-T11.2.1 Restaurant endpoints + UI
- ROPS-T11.2.2 Validation for timezone/state

## ROPS-S11.3 — Users management (invite/role/access/MFA/reset)
**Labels:** `web-admin`, `auth`, `security`
Buttons:
- Invite user
- Resend invite
- Change role (confirm modal)
- Set restaurant access (restaurant_ids)
- Deactivate/reactivate
- Force password reset
- Require MFA toggle

**Acceptance Criteria**
- Role changes & access changes logged
- Cannot remove last owner from an org without explicit override flow

**Subtasks**
- ROPS-T11.3.1 Admin endpoints
- ROPS-T11.3.2 UI forms + modals
- ROPS-T11.3.3 Safety constraints (last owner protection)

## ROPS-S11.4 — Feature flags (global/org/restaurant)
**Labels:** `web-admin`, `backend`
**Acceptance Criteria**
- Flags scoped and evaluated consistently
- Flag changes audited

**Subtasks**
- ROPS-T11.4.1 Feature flag storage model
- ROPS-T11.4.2 Admin UI CRUD
- ROPS-T11.4.3 Client evaluation library

## ROPS-S11.5 — AI configuration + cost ceilings
**Labels:** `web-admin`, `ai`, `observability`
**Acceptance Criteria**
- Per-restaurant monthly AI cost ceiling
- Exceed ceiling blocks AI calls gracefully with UI message to owner

**Subtasks**
- ROPS-T11.5.1 Track tokens/cost per restaurant
- ROPS-T11.5.2 Config UI + enforcement in AI service
- ROPS-T11.5.3 Alerts to ops when ceiling exceeded

## ROPS-S11.6 — Impersonation (high-risk)
**Labels:** `web-admin`, `security`
**Acceptance Criteria**
- Reason required
- Max session 30 minutes
- Banner always visible
- All actions audit record includes real actor + impersonated user

**Subtasks**
- ROPS-T11.6.1 Impersonation token mechanism
- ROPS-T11.6.2 UI start/stop impersonation
- ROPS-T11.6.3 Audit + security event logging

## ROPS-S11.7 — Audit log viewer + export
**Labels:** `web-admin`, `db`
**Acceptance Criteria**
- Filter by actor/entity/date
- Export CSV
- Read-only; no edits

**Subtasks**
- ROPS-T11.7.1 Audit query endpoints
- ROPS-T11.7.2 UI filters + export

## ROPS-S11.8 — Notification templates management (admin editable)
**Labels:** `web-admin`, `notifications`
**Acceptance Criteria**
- Admin can edit templates with preview
- Changes audited
- Variables validated

**Subtasks**
- ROPS-T11.8.1 Template storage + versioning
- ROPS-T11.8.2 Admin editor UI
- ROPS-T11.8.3 Preview rendering endpoint

---

# EPIC ROPS-E12 — Notifications + Preferences + Operational Alerts
**Goal:** Email/SMS/push dispatch, user preferences, required compliance alerts.

## ROPS-S12.1 — Notification service (email + optional sms/push)
**Labels:** `notifications`, `backend`
**Acceptance Criteria**
- Email delivery via SES/Resend
- Retries + dead-letter queue
- Audit significant sends (compliance, payroll)

**Subtasks**
- ROPS-T12.1.1 Email send pipeline
- ROPS-T12.1.2 Retry + DLQ
- ROPS-T12.1.3 Webhook callbacks (bounces)

## ROPS-S12.2 — Preferences UI (Owner/Manager)
**Labels:** `web-owner`, `mobile`
**Acceptance Criteria**
- Quiet hours implemented
- Cannot disable mandatory compliance notifications if super_admin locks them

**Subtasks**
- ROPS-T12.2.1 Preferences DB model
- ROPS-T12.2.2 UI toggles + save
- ROPS-T12.2.3 Enforcement logic

## ROPS-S12.3 — Restaurant operational alerts
**Labels:** `backend`, `web-owner`
Alerts:
- Payroll due
- Invoice due
- Cashflow low
- Bank sync failure
- POS sync failure

**Acceptance Criteria**
- Alerts visible in UI and delivered per preferences

**Subtasks**
- ROPS-T12.3.1 Alert rules jobs
- ROPS-T12.3.2 UI notification center

---

# EPIC ROPS-E13 — Reporting (PDF Generation + Scheduled Delivery)
**Goal:** PDF generation service, S3 storage, scheduling, advisor access.

## ROPS-S13.1 — Reporting worker + S3 storage
**Labels:** `reporting`, `aws`, `backend`
**Acceptance Criteria**
- Reports stored in S3, access via presigned GET (1 hour)
- Generation audited

**Subtasks**
- ROPS-T13.1.1 PDF generation engine (Puppeteer)
- ROPS-T13.1.2 S3 storage + lifecycle
- ROPS-T13.1.3 Presigned URL endpoints

## ROPS-S13.2 — Reports UI (Owner + Advisor read-only)
**Labels:** `web-owner`, `web-admin`
Buttons:
- Generate report (Owner/Ops/Admin)
- Schedule delivery (Owner/Ops)
- Download (Owner/Advisor)
- Share to advisor (Owner)

**Acceptance Criteria**
- Advisor cannot generate unless flag enabled
- Downloads logged

**Subtasks**
- ROPS-T13.2.1 Reports list UI
- ROPS-T13.2.2 Generate modal + progress
- ROPS-T13.2.3 Schedule UI + recipients

---

# EPIC ROPS-E14 — Integrations (QuickBooks export, POS sync hooks)
**Goal:** Export, mapping, logs; future-proof POS.

## ROPS-S14.1 — QuickBooks OAuth + export
**Labels:** `integrations`, `web-owner`
**Acceptance Criteria**
- Owner can connect QBO
- Mapping of categories to chart of accounts
- Export transactions with status + error logs

**Subtasks**
- ROPS-T14.1.1 OAuth flow
- ROPS-T14.1.2 Mapping UI
- ROPS-T14.1.3 Export endpoint + job queue
- ROPS-T14.1.4 Export logs UI

## ROPS-S14.2 — POS integration scaffolding (Square/Toast placeholder)
**Labels:** `integrations`, `backend`
**Acceptance Criteria**
- Sync status page shows connected/failed/last sync
- Failures create ops exceptions

**Subtasks**
- ROPS-T14.2.1 Integration abstraction interfaces
- ROPS-T14.2.2 Status endpoints + UI
- ROPS-T14.2.3 Failure → exception path

---

# EPIC ROPS-E15 — Restaurant KPIs (Labor%, Prime Cost, Tips, COGS)
**Goal:** Add restaurant-centric KPIs to dashboards and reporting.

## ROPS-S15.1 — Labor % of sales KPI
**Labels:** `backend`, `web-owner`, `mobile`
**Acceptance Criteria**
- KPI computed weekly/monthly
- Threshold alert configurable by owner
- Manager sees operational view, owner sees full trend

**Subtasks**
- ROPS-T15.1.1 Compute labor totals from payroll
- ROPS-T15.1.2 Sales totals from POS/transactions
- ROPS-T15.1.3 UI widget + configuration modal

## ROPS-S15.2 — Prime cost KPI
**Labels:** `backend`, `web-owner`
**Acceptance Criteria**
- Prime cost = COGS + labor
- Displays trend + explanation

**Subtasks**
- ROPS-T15.2.1 Category mapping for COGS
- ROPS-T15.2.2 UI widget + report inclusion

## ROPS-S15.3 — Tip tracking & allocation reporting
**Labels:** `payroll`, `compliance`
**Acceptance Criteria**
- Tips captured/imported
- Reports downloadable

**Subtasks**
- ROPS-T15.3.1 Tip capture model
- ROPS-T15.3.2 Allocation rules (configurable)
- ROPS-T15.3.3 Tip compliance reports

---

# EPIC ROPS-E16 — Observability, Security Hardening, Performance Gates
**Goal:** Production monitoring, alerting, load/perf targets, security checks.

## ROPS-S16.1 — Structured logging + tracing
**Labels:** `observability`, `backend`
**Acceptance Criteria**
- Logs include request_id + user_id + restaurant_id
- Correlates across services

**Subtasks**
- ROPS-T16.1.1 pino config + middleware
- ROPS-T16.1.2 Trace propagation headers

## ROPS-S16.2 — Sentry error tracking
**Labels:** `observability`
**Acceptance Criteria**
- Errors tagged with role/restaurant/request_id
- Source maps uploaded for web

**Subtasks**
- ROPS-T16.2.1 Backend Sentry
- ROPS-T16.2.2 Web Sentry
- ROPS-T16.2.3 Mobile Sentry

## ROPS-S16.3 — Datadog APM + dashboards
**Labels:** `observability`, `performance`
**Acceptance Criteria**
- Dashboards: API latency, DB time, queue depth, AI latency/cost

**Subtasks**
- ROPS-T16.3.1 APM instrumentation
- ROPS-T16.3.2 Dashboard setup + alert thresholds

## ROPS-S16.4 — Performance targets & load tests
**Labels:** `performance`
Targets:
- Dashboard cached p95 < 200ms
- AI insights cached < 50ms
- P&L cached fast, invalidations correct

**Subtasks**
- ROPS-T16.4.1 Load test scripts
- ROPS-T16.4.2 Run in staging and report

## ROPS-S16.5 — Security baseline (OWASP)
**Labels:** `security`
**Subtasks**
- ROPS-T16.5.1 CSRF strategy for refresh/mutations
- ROPS-T16.5.2 HSTS and TLS config verification
- ROPS-T16.5.3 Secrets scanning + dependency checks

---

# EPIC ROPS-E17 — QA Automation & Release Readiness
**Goal:** E2E flows, role matrix tests, RLS tests, release checklist.

## ROPS-S17.1 — E2E critical flows
**Labels:** `e2e`
Flows:
- Login → policy accept → dashboard
- Payroll review → approve → status updates
- Transaction recategorize → P&L refresh
- Invoice upload → OCR processing → approve/dispute
- AI chat → action card → approve → audit

**Subtasks**
- ROPS-T17.1.1 Web e2e suite (Playwright)
- ROPS-T17.1.2 Mobile e2e suite (Detox or equivalent)

## ROPS-S17.2 — Role matrix + RLS enforcement tests
**Labels:** `security`, `integration-test`
**Acceptance Criteria**
- Each role cannot access forbidden endpoints even if guessing URLs

**Subtasks**
- ROPS-T17.2.1 Automated tests per endpoint per role
- ROPS-T17.2.2 RLS negative tests (cross-restaurant)

## ROPS-S17.3 — Release checklist & runbooks
**Labels:** `infra`, `ops`
**Subtasks**
- ROPS-T17.3.1 Incident response runbook
- ROPS-T17.3.2 Rollback runbook
- ROPS-T17.3.3 Backup/restore drill plan

---

## 4) Required Endpoint Inventory (Must be implemented; QA uses this list)
### Auth
- POST `/auth/login`
- POST `/auth/mfa/verify`
- POST `/auth/refresh`
- POST `/auth/logout`
- POST `/auth/forgot-password`
- POST `/auth/reset-password` (define explicitly)

### Dashboard
- GET `/dashboard/summary`
- GET `/ai/insights`
- DELETE `/ai/insights/:id`
- GET `/payroll/status`
- GET `/vendors/payments-due`
- GET `/staff/on-shift`

### Payroll
- GET `/payroll/runs/current`
- POST `/payroll/runs/:id/approve`
- POST `/payroll/runs/:id/reject`
- PUT `/payroll/line-items/:id`
- GET `/payroll/runs`
- POST `/payroll/runs/draft` (service token)

### Accounting
- GET `/accounting/pl`
- GET `/accounting/transactions`
- PUT `/accounting/transactions/:id/category`
- GET `/accounting/cash-flow`
- POST `/accounting/transactions/manual`
- POST `/integrations/plaid/webhook`
- POST `/integrations/quickbooks/export`

### Vendors/Invoices + Files
- GET `/vendors`
- POST `/vendors`
- PUT `/vendors/:id`
- DELETE `/vendors/:id` (soft delete/archive)
- GET `/invoices`
- POST `/invoices/upload`
- GET `/invoices/:id`
- POST `/invoices/:id/approve`
- POST `/invoices/:id/dispute`
- POST `/files/presign`
- POST `/files/confirm`

### AI
- POST `/ai/chat/message` (SSE stream)
- GET `/ai/chat/history`
- POST `/ai/chat/action`
- POST `/ai/chat/escalate`
- POST `/ai/chat/voice`

### Admin Exceptions
- GET `/admin/exceptions`
- POST `/admin/exceptions/:id/assign`
- GET `/admin/exceptions/:id/detail`
- POST `/admin/exceptions/:id/resolve`
- POST `/admin/exceptions/:id/escalate`
- GET `/admin/exceptions/analytics`

### Policies
- GET `/policies/current`
- POST `/policies/accept`
- Admin:
  - POST `/admin/policies`
  - PUT `/admin/policies/:id`
  - POST `/admin/policies/:id/publish`
  - GET `/admin/policies/history`

---

## 5) UI Screen Inventory (Every screen must be built; QA checks list)
### Web Owner
- Login, MFA, Policy acceptance
- Dashboard
- Payroll current, payroll history, payroll run detail
- Accounting: P&L, Transactions, Cash Flow, Reconciliation
- Vendors list + vendor detail
- Invoices inbox + invoice detail + upload modal
- AI chat
- Reports
- Settings: Profile, Notifications, Integrations

### Mobile
- Login, MFA, Policy acceptance
- Dashboard
- Payroll (role-variant)
- Invoices (upload/view), Vendors (view)
- AI chat (streaming)
- Notifications inbox
- Settings (basic: profile/preferences)

### Web Admin
- Admin login, MFA, policy acceptance
- Admin dashboard
- Organizations, Restaurants, Users
- Exceptions queue + exception detail
- Policies editor
- Feature flags
- AI config + cost limits
- Notification templates
- Audit logs
- Impersonation screen

---

## 6) Final Notes (Strict)
- No feature is considered “done” if only UI is built. API must enforce.
- No feature is considered “done” if only API is built. UI must have full states and modals.
- Every “Add” implies “Edit” + “Archive/Delete” + audit trail.
- Policy docs must be editable by super_admin and enforceable at API layer.
- Ensure staging mirrors production as closely as possible for auth, policies, and RLS.

---

## 7) Items Requiring Immediate Product Decision (Create Jira tickets as “Decision/Spike”)
1. Mobile refresh token strategy (cookie vs secure storage)
2. Payroll processor order (Gusto vs ADP)
3. Advisor AI chat access default (off recommended)
4. Stripe Treasury payments phase (Phase 2 recommended)

---
**END — JIRA‑READY FINAL BUILD DOCUMENT v1.0**