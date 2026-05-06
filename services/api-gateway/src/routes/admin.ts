import { FastifyInstance } from 'fastify';
import { ROLES } from '@restroops/auth';
import { authorize } from '../middleware/auth.js';

export default async function adminRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authorize([ROLES.SUPER_ADMIN]));

  fastify.get('/stats', async (request, reply) => {
    const totalRevenue = await request.db
      .selectFrom('transactions')
      .select(({ fn }) => fn.sum<string>('amount').as('sum'))
      .where('type', '=', 'revenue')
      .executeTakeFirst();

    const activeOrgs = await request.db
      .selectFrom('organizations')
      .select(({ fn }) => fn.count<string>('id').as('count'))
      .executeTakeFirst();

    const aiAgentCalls = await request.db
      .selectFrom('ai_messages')
      .select(({ fn }) => fn.count<string>('id').as('count'))
      .where('role', '=', 'assistant')
      .executeTakeFirst();

    return {
      success: true,
      message: 'Admin stats retrieved',
      data: {
        totalRevenue: totalRevenue?.sum || '0',
        activeOrgs: activeOrgs?.count || '0',
        aiAgentCalls: aiAgentCalls?.count || '0',
        dbHealth: '99.9%',
      },
      error: null
    };
  });

  fastify.get('/recent-organizations', async (request, reply) => {
    const orgs = await request.db
      .selectFrom('organizations')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(5)
      .execute();
    return {
      success: true,
      message: 'Recent organizations retrieved',
      data: orgs,
      error: null
    };
  });

  fastify.get('/system-exceptions', async (request, reply) => {
    const exceptions = await request.db
      .selectFrom('ai_exceptions')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(10)
      .execute();
    return {
      success: true,
      message: 'System exceptions retrieved',
      data: exceptions,
      error: null
    };
  });

  fastify.get('/organizations', async (request, reply) => {
    const orgs = await request.db
      .selectFrom('organizations')
      .selectAll()
      .execute();
    return {
      success: true,
      message: 'All organizations retrieved',
      data: orgs,
      error: null
    };
  });

  fastify.get('/platform-users', async (request, reply) => {
    const users = await request.db
      .selectFrom('users')
      .select(['id', 'email', 'role', 'last_login_at', 'is_active'])
      .execute();
    return {
      success: true,
      message: 'Platform users retrieved',
      data: users,
      error: null
    };
  });

  fastify.get('/system-logs', async (request, reply) => {
    const logs = await request.db
      .selectFrom('audit_log')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(100)
      .execute();
    return {
      success: true,
      message: 'System logs retrieved',
      data: logs,
      error: null
    };
  });

  fastify.post('/organizations', async (request, reply) => {
    const { name } = request.body as any;
    const org = await request.db
      .insertInto('organizations')
      .values({ name })
      .returningAll()
      .executeTakeFirstOrThrow();
    return {
      success: true,
      message: 'Organization created',
      data: org,
      error: null
    };
  });
}

