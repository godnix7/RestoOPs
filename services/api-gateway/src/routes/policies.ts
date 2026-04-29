import { FastifyInstance } from 'fastify';
import { createDb } from '@restroops/db';
import { policyAcceptanceSchema } from '@restroops/shared';

export default async function policyRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const policies = await request.db
      .selectFrom('policies')
      .selectAll()
      .where('is_published', '=', true)
      .execute();
    return policies;
  });

  fastify.get('/pending', async (request, reply) => {
    const user = request.user as any;
    if (!user) return [];

    const db = request.db;

    // Subquery for accepted policy IDs
    const acceptedIds = db
      .selectFrom('policy_acceptances')
      .select('policy_id')
      .where('user_id', '=', user.userId);

    const pending = await db
      .selectFrom('policies')
      .selectAll()
      .where('is_published', '=', true)
      .where('id', 'not in', acceptedIds)
      .execute();

    return pending;
  });

  fastify.post('/accept', async (request, reply) => {
    const { policyIds } = policyAcceptanceSchema.parse(request.body);
    const user = request.user as any;

    const acceptances = policyIds.map(id => ({
      user_id: user.userId,
      policy_id: id,
      ip_address: request.ip,
      user_agent: request.headers['user-agent']
    }));

    await request.db
      .insertInto('policy_acceptances')
      .values(acceptances)
      .execute();

    return { message: 'Policies accepted' };
  });
}
