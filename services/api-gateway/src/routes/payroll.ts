import { FastifyInstance } from 'fastify';
import { payrollApprovalSchema } from '@restroops/shared';
import { ROLES } from '@restroops/auth';
import { authorize } from '../middleware/auth.js';

export default async function payrollRoutes(fastify: FastifyInstance) {
  fastify.get('/runs/current', async (request, reply) => {
    const db = request.db;
    const restaurantId = (request.query as any).restaurantId;
    if (!restaurantId) return reply.status(400).send({ message: 'restaurantId required' });

    const run = await db
      .selectFrom('payroll_runs')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('status', 'in', ['draft', 'pending'])
      .executeTakeFirst();

    if (!run) return { message: 'No active payroll run' };

    const lineItems = await db
      .selectFrom('payroll_line_items')
      .selectAll()
      .where('payroll_run_id', '=', run.id)
      .execute();

    return { ...run, lineItems };
  });

  fastify.post('/runs/:id/approve', {
    preHandler: [authorize([ROLES.OWNER, ROLES.SUPER_ADMIN])]
  }, async (request, reply) => {
    const { id } = request.params as any;
    const user = request.user as any;
    const db = request.db;

    // Use RLS helper
    return await request.rls(async (trx) => {
      // Check for open exceptions
      const exceptions = await trx
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

      await trx
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
  });
}
