import { createDb } from '@restroops/db';
export default async function payrollRoutes(fastify) {
    const db = createDb(process.env.DATABASE_URL || '');
    fastify.get('/runs/current', async (request, reply) => {
        const restaurantId = request.query.restaurantId;
        if (!restaurantId)
            return reply.status(400).send({ message: 'restaurantId required' });
        const run = await db
            .selectFrom('payroll_runs')
            .selectAll()
            .where('restaurant_id', '=', restaurantId)
            .where('status', 'in', ['draft', 'pending'])
            .executeTakeFirst();
        if (!run)
            return { message: 'No active payroll run' };
        const lineItems = await db
            .selectFrom('payroll_line_items')
            .selectAll()
            .where('payroll_run_id', '=', run.id)
            .execute();
        return { ...run, lineItems };
    });
    fastify.post('/runs/:id/approve', async (request, reply) => {
        const { id } = request.params;
        const user = request.user;
        if (user.role !== 'owner' && user.role !== 'super_admin') {
            return reply.status(403).send({ message: 'Only owners can approve payroll' });
        }
        // Check for open exceptions
        const exceptions = await db
            .selectFrom('ai_exceptions')
            .select('id')
            .where('entity_id', '=', id)
            .where('status', '=', 'open')
            .execute();
        if (exceptions.length > 0) {
            return reply.status(400).send({
                message: 'Cannot approve payroll with open exceptions',
                exceptionCount: exceptions.length
            });
        }
        await db
            .updateTable('payroll_runs')
            .set({
            status: 'approved',
            approved_by: user.userId,
            approved_at: new Date()
        })
            .where('id', '=', id)
            .execute();
        return { message: 'Payroll approved' };
    });
}
