# RestroOps AI — Full Build Guide
## Developer Implementation Document

**NO MOCK DATA · NO DEMO FRONTEND · REAL-TIME ONLY**

| Property | Value |
| :--- | :--- |
| Document Type | Developer Build Guide — Every screen, every button, every API |
| Audience | Frontend devs, backend devs, fullstack engineers |
| Rule #1 | ZERO mock data. Every value must come from a real API call. |
| Rule #2 | Every button has a real API endpoint. No fake handlers. |
| Rule #3 | Role access enforced at DB (RLS) + API middleware + UI level (3 layers). |
| Rule #4 | Any feature not yet built = hidden via feature flag. Not mocked. |

---

## 1. Role System — Complete Authorization Map

> [!WARNING]
> This is the single most important section. Every UI decision, every button, every API guard is based on this role map. Read this before building anything.

### 1.1 The 6 Roles

| Role | Who Is This | Platform | Created By | Can Create Role |
| :--- | :--- | :--- | :--- | :--- |
| **super_admin** | RestroOps CTO / founding team | Admin web only | Hardcoded in DB seed | No one — manually assigned |
| **ops_manager** | RestroOps client-facing staff | Admin web only | super_admin only | Cannot create any role |
| **ai_agent** | Automated AI worker per restaurant | Backend only | System on account creation | N/A — not a human |
| **owner** | Restaurant paying client (owner) | Mobile + Web | super_admin OR ops_manager | Can create: manager, advisor |
| **manager** | On-site restaurant manager | Mobile (limited web) | owner only | Cannot create any role |
| **advisor** | External CPA / accountant | Web read-only | owner only | Cannot create any role |

### 1.2 Role Creation Rules (Authorization Chain)

- 🔒 **super_admin** is the only role that can create an **ops_manager** account. There is NO UI for this — it is done via a protected Admin CLI command or a seeded SQL migration.
- 🔒 **ops_manager** CANNOT create any user accounts. They can only manage existing restaurant accounts assigned to them.
- 🔒 **owner** can invite a **manager** or **advisor** via the Settings → Team page. The invite sends a magic link email. Owner CANNOT create another owner.
- 🔒 **manager** and **advisor** have NO ability to create, invite, or modify any user accounts.

#### Who Can Grant This Role
| Role | super_admin | ops_manager | owner | manager | advisor |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **super_admin** | — | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **ops_manager** | ❌ Never | — | ❌ Never | ❌ Never | ❌ Never |
| **owner** | ❌ Never | ❌ Never | — | ❌ Never | ❌ Never |
| **manager** | ❌ Never | ❌ Never | ✅ Owner invites | — | ❌ Never |
| **advisor** | ❌ Never | ❌ Never | ✅ Owner invites | ❌ Never | — |

### 1.3 Role Permission Table — Every Feature

| Feature / Action | super_admin | ops_manager | owner | manager | advisor |
| :--- | :--- | :--- | :--- | :--- | :--- |
| View own dashboard | ✅ | ✅ all accounts | ✅ own only | ✅ own only | ✅ read-only |
| Approve payroll | ✅ | ✅ override only | ✅ | ❌ | ❌ |
| Edit payroll line items | ✅ | ✅ | ❌ (must flag) | ✅ own shifts only | ❌ |
| View payroll | ✅ | ✅ | ✅ | ❌ | ✅ read-only |
| View P&L / reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| Export reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| Recategorize transactions | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add manual transaction | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve invoices | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dispute invoices | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upload invoices | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add / edit vendors | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve compliance drafts | ✅ | ✅ | ✅ (review) | ❌ | ❌ |
| Submit compliance filings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Upload permits / docs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add employee | ✅ | ✅ | ✅ | ❌ | ❌ |
| Terminate employee | ✅ | ❌ | ✅ | ❌ | ❌ |
| Approve time-off | ✅ | ❌ | ✅ | ✅ | ❌ |
| View employee records | ✅ | ✅ | ✅ | Name+contact only | ❌ |
| Log inventory count | ✅ | ✅ | ✅ | ✅ | ❌ |
| View inventory analytics | ✅ | ✅ | ✅ | ✅ | ❌ |
| Chat with AI agent | ✅ | ✅ (client view) | ✅ | ✅ | ❌ |
| Exception queue (view) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Exception queue (resolve) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Feature flags | ✅ | ❌ | ❌ | ❌ | ❌ |
| Billing management | ✅ | View only | View + upgrade | ❌ | ❌ |
| Invite team members | ✅ | ❌ | ✅ (mgr+advisor) | ❌ | ❌ |
| Impersonate user | ✅ | ✅ (support only) | ❌ | ❌ | ❌ |
| Audit log access | ✅ full | ✅ assigned accts | ✅ own actions | ✅ own actions | ❌ |
| API config / integrations | ✅ | ❌ | ✅ (connect POS/bank) | ❌ | ❌ |

---

## 2. Authentication — Every Screen & Button

> [!WARNING]
> NO session persistence in localStorage. Access token in memory only. Refresh token in httpOnly cookie only.

### 2.1 Login Screen
**Route:** `/login` | **Accessible to:** unauthenticated users only.

| Element | Type | Real-Time Behavior | API Called |
| :--- | :--- | :--- | :--- |
| Email input | text input | Validate format on blur. Show red border + 'Invalid email' if bad format. | — |
| Password input | password input | Show/hide toggle (eye icon). Min 8 chars enforced on submit. | — |
| Sign In button | primary button | Disabled until both fields non-empty. Shows spinner on click. Text changes to 'Signing in…' | `POST /v1/auth/login` |
| Forgot Password link | text link | Navigate to `/forgot-password` page | — |
| Error banner | alert (red) | Show below button on API error: 'Invalid email or password' | — |
| Lockout banner | alert (orange) | Show if API returns 429: 'Too many attempts. Try again in X minutes.' | — |

> [!NOTE]
> After successful login: if user.role is super_admin or ops_manager → redirect to /admin/dashboard. All others → /dashboard. Role comes from JWT, never from localStorage.

### 2.2 MFA Verification Screen
**Route:** `/mfa` | **Reachable if:** `POST /auth/login` returned `mfa_required:true`.

| Element | Type | Behavior | API Called |
| :--- | :--- | :--- | :--- |
| OTP input (6 digits) | number input | Auto-submit when 6th digit entered. Accept paste. | `POST /v1/auth/mfa/verify` |
| Verify button | primary button | Disabled until 6 digits entered. Spinner on click. | `POST /v1/auth/mfa/verify` |
| Use SMS instead link | text link | Triggers SMS OTP to phone. Shows 'Code sent' toast. | `POST /v1/auth/mfa/sms-send` |
| Resend code link | text link | Show after 30s countdown. Disabled until countdown done. | `POST /v1/auth/mfa/sms-send` |
| Back to Login link | text link | Clear temp_token from memory, navigate to `/login` | — |
| Error text | inline red text | 'Incorrect code. X attempts remaining.' Below input. | — |

### 2.3 Forgot Password Screen
| Element | Type | Behavior | API Called |
| :--- | :--- | :--- | :--- |
| Email input | text input | Same validation as login screen | — |
| Send Reset Link button | primary button | Spinner on click. Always show success message (security). | `POST /v1/auth/forgot-password` |
| Success message | green banner | 'If that email is registered, a reset link has been sent.' | — |

---

## 3. Restaurant Owner — Web App (app.restroops.ai)

> [!WARNING]
> Every number, chart, and label must come from a real API call. No hardcoded values. No mock data. Show skeleton loaders while fetching. Show error state if fetch fails.

### 3.1 Left Sidebar Navigation
| Menu Item | Sub-items | Visible To | Real-Time Badge |
| :--- | :--- | :--- | :--- |
| 🏠 Dashboard | — | owner, manager | Unread alerts count from `GET /notifications/count` |
| 💰 Payroll | Current, History | owner | 'PENDING' badge from `GET /payroll/status` |
| 📒 Accounting | P&L, Trans., Recon., Cash Flow | owner, advisor | Red dot if reconciliation_status=discrepancy |
| 🧾 Vendors & Invoices | Vendors, Inbox, Schedule | owner | Count of invoices with status=needs_review |
| 📜 Compliance | Calendar, Vault, Tax | owner, advisor | Count of overdue items from `GET /compliance/calendar` |
| 📦 Inventory | Dashboard, Log, Variance | owner, manager | — |
| 👥 HR & Staff | Directory, Onboarding, Time-Off | owner | Count of pending time-off requests |
| 🤖 AI Chat | — | owner, manager | — |
| 📊 Reports | — | owner, advisor | — |
| ⚙️ Settings | Profile, Team, Billing, Integrations | owner | — |

### 3.2 Dashboard Screen
**Endpoint:** `GET /v1/dashboard/summary?restaurant_id=X&period=week`

| Widget / Element | What It Shows | Data Source | Click Action |
| :--- | :--- | :--- | :--- |
| Weekly P&L Card | Revenue / Expenses / Net Profit. Green/Red. | `dashboard.pl` object | Opens `/accounting/pl` |
| Payroll Status Banner | 'Payroll pending — $X for N employees.' | `dashboard.payroll` object | Opens `/payroll/current` |
| Cash Flow Sparkline | 30-day projection line chart. | `dashboard.cash_flow_30d` | Opens `/accounting/cash-flow` |
| AI Insights Feed | Cards with AI reasoning. | `GET /v1/ai/insights` | 'Tell Me More' → chat. 'Dismiss' → DELETE. |
| Quick Actions Bar | Log Sale · Submit Expense · Message Agent | Static buttons | Each opens a modal |
| Vendor Payments Due | List of next 3 upcoming payments. | `dashboard.vendor_dues` | Opens invoice detail / Pay Now |
| Staff On Shift Counter | '7 staff currently clocked in' | `GET /v1/staff/on-shift` | Opens HR directory filtered |

### 3.3 Log Sale Modal (Quick Action)
| Field / Button | Type | Validation | API |
| :--- | :--- | :--- | :--- |
| Sale Amount ($) | number input | Required. Min $0.01. | — |
| Date | date picker | Required. Cannot be future. | — |
| Payment Method | dropdown | Cash, Card, Online. Required. | — |
| Note (optional) | text input | Max 200 chars | — |
| Submit Sale button | primary button | Disabled if empty. Spinner. | `POST /v1/accounting/transactions/manual` |

---

## 4. Mobile App (iOS + Android) — All Screens & Buttons

> [!WARNING]
> Mobile = same real APIs as web. NO separate mobile mock endpoints.

### 4.1 Bottom Tab Navigation
| Tab | Icon | Badge Logic | Visible To |
| :--- | :--- | :--- | :--- |
| Home | 🏠 | Red dot if unread notifications | owner, manager |
| Payroll | 💰 | 'PENDING' chip if status=pending_approval | owner only |
| Reports | 📊 | — | owner, advisor |
| AI Chat | 🤖 | — | owner, manager |
| Settings | ⚙️ | — | owner only |

---

## 5. Admin Operations Platform (admin.restroops.ai)

- 🔒 This platform is ONLY for **super_admin** and **ops_manager** roles.
- 🔒 Any request with a different role JWT must return **403** immediately.

### 5.1 Admin Sidebar Navigation
| Menu Item | Visible To | Badge |
| :--- | :--- | :--- |
| 📊 Overview Dashboard | super_admin, ops_manager | — |
| ⚡ Exception Queue | super_admin, ops_manager | Count of open exceptions |
| 🏪 Accounts | super_admin, ops_manager | Count of at-risk accounts |
| 🚩 Feature Flags | super_admin only | — |

---

## 6. Real-Time & Anti-Mock-Data Rules

> [!WARNING]
> These rules must be enforced in code review. Any PR that introduces hardcoded data or fake loaders is rejected.

### 6.1 Loading States — Mandatory
- **Skeleton loader**: From the moment fetch starts until data arrives.
- **Empty state**: When API returns empty. Show illustration + message.
- **Error state**: Show error message + 'Retry' button. Log to Sentry.
- **Optimistic update**: For fast actions (recategorize, dismiss). Revert on failure.

### 6.2 Polling & Real-Time Updates
| Data | Update Method | Frequency |
| :--- | :--- | :--- |
| Dashboard widgets | React Query refetchInterval | 60 seconds |
| Payroll status | WebSocket subscription | Instant push |
| AI chat responses | Server-Sent Events (SSE) | Token streaming |
| Exception queue | React Query refetchInterval | 30 seconds |

### 6.3 Forbidden Patterns
- ❌ `setTimeout(() => setLoading(false), 2000)`
- ❌ `const data = { revenue: 48200 }`
- ❌ `if (DEV) return mockData`
- ❌ `Math.random()` for metrics
- ❌ `// TODO: connect to API` in merged code

---

## 7. API Structure & Response Standards

### 7.1 Response Format
```json
{
  "success": boolean,
  "message": "Human readable summary",
  "data": object | null,
  "error": object | null,
  "meta": { "page": 1, "limit": 20, "total": 100 } | null
}
```

### 7.2 Authentication Headers
- `Authorization`: `Bearer <access_token>`
- `X-Restaurant-ID`: UUID of active restaurant (Verified against JWT)
- `X-Request-ID`: Client-generated UUID v4

---

## 8. Database Rules — No Exceptions

- 🔒 Every restaurant table MUST have a `restaurant_id` with Supabase RLS.
- 🔒 `audit_log` is append-only. NO UPDATE/DELETE.
- 🔒 Soft deletes only. Use `deleted_at`.
- 🔒 Financial amounts as `NUMERIC(12,2)`. NEVER FLOAT.

---

## 9. Notification System Triggers

| Trigger Event | Recipient | Channels | Message |
| :--- | :--- | :--- | :--- |
| Payroll draft ready | owner | Push + Email | Your payroll is ready. $X... |
| Invoice discrepancy | owner | Push + Email | Invoice from [Vendor] is $X higher... |
| Compliance overdue | owner + ops | Push + Email + SMS | OVERDUE: [Filing] due on [date]... |
| SLA breach warning | ops_manager | Admin + Email | Exception #X SLA breach in 90 min... |

---

## 10. Build Order — Phase 1 Must-Haves

1.  **Database schema** + RLS policies + Supabase Auth.
2.  **JWT auth flow** (login, MFA, refresh, logout).
3.  **Role middleware** on all API routes.
4.  **Admin**: Account management + Exception queue.
5.  **Owner Dashboard** (Summary API).
6.  **Payroll module** (Draft, Approve, Reject).
7.  **Accounting**: Plaid + Auto-categorize + P&L.
8.  **AI Chat** (SSE streaming + tool calls).
9.  **Notifications** (Push + Email).
10. **Reports** (PDF generation).

---
**— End of RestroOps AI Full Build Guide —**
**Real data only. No mocks. No demos.**
