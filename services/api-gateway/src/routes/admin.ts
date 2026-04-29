import { FastifyInstance } from 'fastify';
import { ROLES } from '@restroops/auth';
import { authorize } from '../middleware/auth.js';

export default async function adminRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authorize([ROLES.SUPER_ADMIN]));

  fastify.get('/organizations', async (request, reply) => {
    const orgs = await request.db
      .selectFrom('organizations')
      .selectAll()
      .execute();
    return orgs;
  });

  fastify.get('/platform-users', async (request, reply) => {
    const users = await request.db
      .selectFrom('users')
      .select(['id', 'email', 'role', 'last_login_at', 'is_active'])
      .execute();
    return users;
  });

  fastify.get('/system-logs', async (request, reply) => {
    const logs = await request.db
      .selectFrom('audit_log')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(100)
      .execute();
    return logs;
  });

  fastify.post('/organizations', async (request, reply) => {
    const { name } = request.body as any;
    const org = await request.db
      .insertInto('organizations')
      .values({ name })
      .returningAll()
      .executeTakeFirstOrThrow();
    return org;
  });
}
