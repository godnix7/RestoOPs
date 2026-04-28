import { z } from 'zod';

export const dashboardSummarySchema = z.object({
  weeklyPnL: z.object({
    revenue: z.number(),
    expenses: z.number(),
    net: z.number(),
    period: z.string(),
  }),
  payrollStatus: z.object({
    currentRunId: z.string().uuid().optional(),
    status: z.string(),
    totalGross: z.number(),
    dueDate: z.string().optional(),
  }),
  cashFlow: z.array(z.object({
    date: z.string(),
    amount: z.number(),
  })),
  insights: z.array(z.object({
    id: z.string().uuid(),
    type: z.string(),
    title: z.string(),
    content: z.string(),
    severity: z.string(),
  })),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
