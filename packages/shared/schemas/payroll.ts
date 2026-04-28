import { z } from 'zod';

export const payrollLineItemSchema = z.object({
  id: z.string().uuid(),
  staffId: z.string().uuid(),
  hoursWorked: z.number(),
  grossPay: z.number(),
  netPay: z.number(),
  overtimeHours: z.number().optional(),
  tips: z.number().optional(),
});

export const payrollRunSchema = z.object({
  id: z.string().uuid(),
  periodStart: z.string(),
  periodEnd: z.string(),
  status: z.enum(['draft', 'pending', 'approved', 'processing', 'completed', 'rejected']),
  totalGross: z.number(),
  totalNet: z.number(),
  lineItems: z.array(payrollLineItemSchema).optional(),
});

export type PayrollRun = z.infer<typeof payrollRunSchema>;
export type PayrollLineItem = z.infer<typeof payrollLineItemSchema>;

export const payrollApprovalSchema = z.object({
  runId: z.string().uuid(),
});
