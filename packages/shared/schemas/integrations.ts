import { z } from 'zod';

export const plaidExchangeTokenSchema = z.object({
  publicToken: z.string(),
  restaurantId: z.string().uuid(),
});

export const integrationStatusSchema = z.object({
  provider: z.enum(['plaid', 'square', 'quickbooks']),
  status: z.string(),
  lastSyncAt: z.string().optional(),
});

export type PlaidExchangeTokenRequest = z.infer<typeof plaidExchangeTokenSchema>;
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;
