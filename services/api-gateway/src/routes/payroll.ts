import { FastifyInstance } from 'fastify';
import { payrollApprovalSchema } from '@restroops/shared';
import { ROLES } from '@restroops/auth';
import { authorize } from '../middleware/auth.js';

export default async function payrollRoutes(fastify: FastifyInstance) {
  fastify.get('/runs/current', async (request, reply) => {
    const db = request.db;
    const restaurantId = (request.query as any).restaurantId;
    if (!restaurantId) return reply.status(400).send({ 
      success: false,
      message: 'restaurantId required',
      data: null,
      error: { code: 'BAD_REQUEST' }
    });

    const run = await db
      .selectFrom('payroll_runs')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('status', 'in', ['draft', 'pending'])
      .executeTakeFirst();

    if (!run) return { 
      success: true,
      message: 'No active payroll run',
      data: null,
      error: null
    };

    const lineItems = await db
      .selectFrom('payroll_line_items')
      .selectAll()
      .where('payroll_run_id', '=', run.id)
      .execute();

    return { 
      success: true,
      message: 'Current payroll run retrieved',
      data: { ...run, lineItems },
      error: null
    };
  });

  fastify.post('/runs/:id/approve', {
    preHandler: [authorize([ROLES.OWNER, ROLES.SUPER_ADMIN])]
  }, async (request, reply) => {
    const { id } = request.params as any;
    const user = request.user as any;
    
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
          success: false,
          message: 'Cannot approve payroll with open exceptions',
          data: { exceptionCount: exceptions.length },
          error: { code: 'PENDING_EXCEPTIONS' }
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

      return { 
        success: true,
        message: 'Payroll approved',
        data: null,
        error: null
      };
    });
  });
}

