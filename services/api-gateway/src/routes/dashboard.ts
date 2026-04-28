import { FastifyInstance } from 'fastify';
import { createDb } from '@restroops/db';
import { sql } from 'kysely';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  const db = createDb(process.env.DATABASE_URL || '');

  fastify.get('/summary', async (request, reply) => {
    const user = request.user as any;
    const restaurantId = (request.query as any).restaurantId;

    if (!restaurantId) {
      return reply.status(400).send({ message: 'restaurantId is required' });
    }

    const cacheKey = `dashboard:${restaurantId}`;
    const cachedData = await (fastify as any).redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 1. Weekly P&L Aggregation
    const weeklyPnL = await db
      .selectFrom('transactions')
      .select([
        sql<number>`SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END)`.as('revenue'),
        sql<number>`SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)`.as('expenses'),
      ])
      .where('restaurant_id', '=', restaurantId)
      .where('date', '>=', sql`CURRENT_DATE - INTERVAL '7 days'` as any)
      .executeTakeFirst();

    // 2. Latest Payroll Run
    const payroll = await db
      .selectFrom('payroll_runs')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .orderBy('created_at', 'desc')
      .executeTakeFirst();

    // 3. Cash Flow Sparkline (last 7 days)
    const cashFlow = await db
      .selectFrom('transactions')
      .select(['date', sql<number>`SUM(CASE WHEN type = 'revenue' THEN amount ELSE -amount END)`.as('net')])
      .where('restaurant_id', '=', restaurantId)
      .where('date', '>=', sql`CURRENT_DATE - INTERVAL '7 days'` as any)
      .groupBy('date')
      .orderBy('date', 'asc')
      .execute();

    // 4. Active AI Insights
    const insights = await db
      .selectFrom('ai_insights')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('is_dismissed', '=', false)
      .limit(5)
      .execute();

    const summary = {
      weeklyPnL: {
        revenue: Number(weeklyPnL?.revenue || 0),
        expenses: Number(weeklyPnL?.expenses || 0),
        net: Number((weeklyPnL?.revenue || 0) as any - (weeklyPnL?.expenses || 0) as any),
        period: 'Last 7 Days',
      },
      payrollStatus: {
        currentRunId: payroll?.id,
        status: payroll?.status || 'no_active_run',
        totalGross: Number(payroll?.total_gross || 0),
      },
      cashFlow: cashFlow.map(cf => ({
        date: cf.date.toString(),
        amount: Number(cf.net),
      })),
      insights: insights.map(i => ({
        id: i.id,
        type: i.type,
        title: i.title,
        content: i.content,
        severity: i.severity,
      })),
    };

    // Cache the result for 5 minutes
    await (fastify as any).redis.set(cacheKey, JSON.stringify(summary), 'EX', 300);

    return summary;
  });
}
