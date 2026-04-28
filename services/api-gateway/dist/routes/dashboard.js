import { createDb } from '@restroops/db';
import { sql } from 'kysely';
export default async function dashboardRoutes(fastify) {
    const db = createDb(process.env.DATABASE_URL || '');
    fastify.get('/summary', async (request, reply) => {
        const user = request.user;
        const restaurantId = request.query.restaurantId;
        if (!restaurantId) {
            return reply.status(400).send({ message: 'restaurantId is required' });
        }
        const cacheKey = `dashboard:${restaurantId}`;
        const cachedData = await fastify.redis.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        // 1. Weekly P&L Aggregation
        const weeklyPnL = await db
            .selectFrom('transactions')
            .select([
            sql `SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END)`.as('revenue'),
            sql `SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)`.as('expenses'),
        ])
            .where('restaurant_id', '=', restaurantId)
            .where('date', '>=', sql `CURRENT_DATE - INTERVAL '7 days'`)
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
            .select(['date', sql `SUM(CASE WHEN type = 'revenue' THEN amount ELSE -amount END)`.as('net')])
            .where('restaurant_id', '=', restaurantId)
            .where('date', '>=', sql `CURRENT_DATE - INTERVAL '7 days'`)
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
                net: Number((weeklyPnL?.revenue || 0) - (weeklyPnL?.expenses || 0)),
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
        await fastify.redis.set(cacheKey, JSON.stringify(summary), 'EX', 300);
        return summary;
    });
}
