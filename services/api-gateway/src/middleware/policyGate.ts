import { FastifyReply, FastifyRequest } from 'fastify';
import { createDb } from '@restroops/db';

export const enforcePolicyAcceptance = async (request: FastifyRequest, reply: FastifyReply) => {
  // Skip for auth and policy routes
  if (request.url.startsWith('/auth') || request.url.startsWith('/policies')) {
    return;
  }

  const user = request.user as any;
  if (!user) return;

  const db = createDb(process.env.DATABASE_URL || '');

  // Get latest published policies
  const latestPolicies = await db
    .selectFrom('policies')
    .select('id')
    .where('is_published', '=', true)
    .execute();

  if (latestPolicies.length === 0) return;

  // Check if user has accepted all of them
  const acceptances = await db
    .selectFrom('policy_acceptances')
    .select('policy_id')
    .where('user_id', '=', user.userId)
    .where('policy_id', 'in', latestPolicies.map(p => p.id))
    .execute();

  if (acceptances.length < latestPolicies.length) {
    return reply.status(403).send({
      code: 'POLICIES_NOT_ACCEPTED',
      message: 'You must accept the latest policies to continue.',
      requiredPolicyIds: latestPolicies.map(p => p.id)
    });
  }
};
