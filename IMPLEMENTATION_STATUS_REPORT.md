# IMPLEMENTATION STATUS REPORT

| Area | Status | Evidence | Action |
| :--- | :--- | :--- | :--- |
| **Auth (Owner)** | PARTIAL | `web-owner/src/app/login/page.tsx` | Add loading/error states, implement MFA toggle in settings. |
| **Auth (Admin)** | MISSING | `apps/web-admin/src/app/` | Create `/login` for Super Admin with MFA requirement. |
| **Authz (RBAC)** | DONE (existing) | `services/api-gateway/src/middleware/auth.ts` | Verify `scopeToRestaurant` works for all tenant routes. |
| **Authz (RLS)** | PARTIAL | `packages/db/migrations/002_rls_policies.sql` | Enable RLS for `transactions`, `payroll_runs`, `ai_insights`, `staff`, `ai_exceptions`. |
| **Policy Gate** | PARTIAL | `services/api-gateway/src/middleware/policyGate.ts` | Implement frontend modal for forced acceptance in both Owner and Admin apps. |
| **UI Wiring (Owner)** | PARTIAL | `apps/web-owner/src/app/page.tsx` | Wire "Log Sale" modal, "Explain" AI trigger, and "Dismiss" insight action. |
| **UI Wiring (Admin)** | PARTIAL | `apps/web-admin/src/app/page.tsx` | Connect sidebar tabs to real data lists (Orgs/Users/Policies). |
| **Billing/Monetization**| PARTIAL | `services/api-gateway/src/services/billingService.ts` | Ensure webhook updates restaurant subscription state correctly. |

## Audit Summary
The foundation is 70% present but lacks the "Production Polish" required by the spec. Specifically, the Admin app is currently an unauthenticated shell, and RLS coverage is missing for the core financial tables. 

## Next Steps
1.  **Auth Foundation**: Implement Admin Login + MFA.
2.  **RLS Hardening**: Complete RLS coverage for all tenant tables.
3.  **Policy Enforcement**: Wire the API gate to a frontend modal.
4.  **End-to-End Wiring**: Fix all dead buttons on the Owner Dashboard.
