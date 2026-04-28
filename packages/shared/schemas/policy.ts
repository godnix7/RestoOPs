import { z } from 'zod';

export const policyAcceptanceSchema = z.object({
  policyIds: z.array(z.string().uuid()),
});

export type PolicyAcceptanceRequest = z.infer<typeof policyAcceptanceSchema>;

export const policySchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['terms', 'privacy', 'cookie', 'dpa', 'acceptable_use']),
  contentMd: z.string(),
  version: z.string(),
  publishedAt: z.string().datetime().optional(),
});

export type Policy = z.infer<typeof policySchema>;
