import { loginSchema } from '@restroops/shared';
import { AuthService } from '@restroops/auth';
import { createDb } from '@restroops/db';
export default async function authRoutes(fastify) {
    const db = createDb(process.env.DATABASE_URL || '');
    fastify.post('/login', async (request, reply) => {
        const { email, password } = loginSchema.parse(request.body);
        const user = await db
            .selectFrom('users')
            .selectAll()
            .where('email', '=', email)
            .where('is_active', '=', true)
            .executeTakeFirst();
        if (!user || !(await AuthService.comparePassword(password, user.password_hash))) {
            return reply.status(401).send({ message: 'Invalid credentials' });
        }
        // Get associated restaurants for claims
        const userRestaurants = await db
            .selectFrom('user_restaurants')
            .select('restaurant_id')
            .where('user_id', '=', user.id)
            .execute();
        const restaurantIds = userRestaurants.map((ur) => ur.restaurant_id);
        const payload = {
            userId: user.id,
            role: user.role,
            organizationId: user.organization_id || undefined,
            restaurantIds,
        };
        const accessToken = AuthService.signAccessToken(payload, process.env.JWT_SECRET || 'secret');
        const refreshToken = AuthService.signRefreshToken(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
        // Store refresh token hash in Redis
        await fastify.redis.set(`refresh_token:${user.id}`, refreshToken, // In production, store a hash
        'EX', 7 * 24 * 60 * 60);
        // Update last login
        await db
            .updateTable('users')
            .set({ last_login_at: new Date() })
            .where('id', '=', user.id)
            .execute();
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organization_id,
            },
        };
    });
    fastify.post('/logout', async (request, reply) => {
        // Logic for denylisting jti or clearing Redis
        return { message: 'Logged out' };
    });
}
