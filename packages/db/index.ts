import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

import { Generated } from 'kysely';

export interface Database {
  organizations: OrganizationTable;
  restaurants: RestaurantTable;
  users: UserTable;
  user_restaurants: UserRestaurantTable;
  audit_log: AuditLogTable;
  policies: PolicyTable;
  policy_acceptances: PolicyAcceptanceTable;
  transactions: TransactionTable;
  payroll_runs: PayrollRunTable;
  ai_insights: AiInsightTable;
  staff: StaffTable;
  payroll_line_items: PayrollLineItemTable;
  ai_exceptions: AiExceptionTable;
  ai_conversations: AiConversationTable;
  ai_messages: AiMessageTable;
  external_integrations: ExternalIntegrationTable;
}

interface ExternalIntegrationTable {
  id: Generated<string>;
  restaurant_id: string;
  provider: 'plaid' | 'square' | 'quickbooks';
  external_id: string;
  access_token: string;
  refresh_token: string | null;
  settings: Generated<any>;
  status: Generated<string>;
  last_sync_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface AiConversationTable {
  id: Generated<string>;
  restaurant_id: string;
  user_id: string;
  title: string | null;
  context_summary: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface AiMessageTable {
  id: Generated<string>;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls: any | null;
  tool_outputs: any | null;
  metadata: any | null;
  created_at: Generated<Date>;
}

interface StaffTable {
  id: Generated<string>;
  restaurant_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string;
  pay_type: 'hourly' | 'salary';
  pay_rate: number | string;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface PayrollLineItemTable {
  id: Generated<string>;
  payroll_run_id: string;
  staff_id: string;
  hours_worked: number | string;
  gross_pay: number | string;
  net_pay: number | string;
  deductions: any;
  overtime_hours: number | string;
  tips: number | string;
  created_at: Generated<Date>;
}

interface AiExceptionTable {
  id: Generated<string>;
  restaurant_id: string;
  type: string;
  severity: string;
  entity_type: string;
  entity_id: string;
  description: string;
  status: Generated<string>;
  resolved_by: string | null;
  resolved_at: Date | null;
  resolution_note: string | null;
  created_at: Generated<Date>;
}

interface TransactionTable {
  id: Generated<string>;
  restaurant_id: string;
  source: string;
  source_reference: string | null;
  amount: number | string;
  type: 'revenue' | 'expense';
  category: string | null;
  subcategory: string | null;
  description: string | null;
  date: Generated<Date | string>;
  category_confidence: number | null;
  is_reconciled: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface PayrollRunTable {
  id: Generated<string>;
  restaurant_id: string;
  period_start: Date | string;
  period_end: Date | string;
  status: Generated<string>;
  total_gross: number | string;
  total_net: number | string;
  approved_by: string | null;
  approved_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface AiInsightTable {
  id: Generated<string>;
  restaurant_id: string;
  type: string;
  title: string;
  content: string;
  severity: string;
  is_dismissed: Generated<boolean>;
  created_at: Generated<Date>;
}

interface OrganizationTable {
  id: Generated<string>;
  name: string;
  tier: Generated<string>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface RestaurantTable {
  id: Generated<string>;
  organization_id: string;
  name: string;
  slug: string;
  settings: Generated<any>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface UserTable {
  id: Generated<string>;
  organization_id: string | null;
  email: string;
  password_hash: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  is_active: Generated<boolean>;
  last_login_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface UserRestaurantTable {
  user_id: string;
  restaurant_id: string;
}

interface AuditLogTable {
  id: Generated<string>;
  organization_id: string | null;
  restaurant_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: any | null;
  ip_address: string | null;
  created_at: Generated<Date>;
}

interface PolicyTable {
  id: Generated<string>;
  type: string;
  content_md: string;
  version: string;
  is_published: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface PolicyAcceptanceTable {
  id: Generated<string>;
  user_id: string;
  policy_id: string;
  accepted_at: Generated<Date>;
  ip_address: string | null;
  user_agent: string | null;
}



export const createDb = (connectionString: string) => {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString,
      }),
    }),
  });
};
