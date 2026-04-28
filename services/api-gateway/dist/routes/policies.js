import { createDb } from '@restroops/db';
import { policyAcceptanceSchema } from '@restroops/shared';
export default async function policyRoutes(fastify) {
    const db = createDb(process.env.DATABASE_URL || '');
    // Get current published policies
    fastify.get('/', async (request, reply) => {
        const policies = await db
            .selectFrom('policies')
            .selectAll()
            .where('is_published', '=', true)
            .execute();
        return policies;
    });
    // Accept policies
    fastify.post('/accept', async (request, reply) => {
        const { policyIds } = policyAcceptanceSchema.parse(request.body);
        const user = request.user;
        if (!user)
            return reply.status(401).send({ message: 'Unauthorized' });
        const acceptances = policyIds.map(id => ({
            user_id: user.userId,
            policy_id: id,
            ip_address: request.ip,
            user_agent: request.headers['user-agent']
        }));
        await db
            .insertInto('policy_acceptances')
            .values(acceptances)
            .execute();
        return { message: 'Policies accepted' };
    });
}
