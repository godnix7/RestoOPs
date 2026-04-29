import { FastifyInstance } from 'fastify';
import { loginSchema } from '@restroops/shared';
import { AuthService, ROLES } from '@restroops/auth';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().optional(),
  role: z.string().optional()
});

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', async (request, reply) => {
    const db = request.db;
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

    if (user.mfa_enabled) {
      const tempToken = AuthService.signTempToken(
        { userId: user.id, pendingMfa: true },
        process.env.JWT_SECRET || 'secret'
      );
      return { mfaRequired: true, tempToken };
    }

    // Get associated restaurants for claims
    const userRestaurants = await db
      .selectFrom('user_restaurants')
      .select('restaurant_id')
      .where('user_id', '=', user.id)
      .execute();

    const restaurantIds = userRestaurants.map((ur: any) => ur.restaurant_id);

    const payload = {
      userId: user.id,
      role: user.role,
      organizationId: user.organization_id || undefined,
      restaurantIds,
    };

    const accessToken = AuthService.signAccessToken(payload, process.env.JWT_SECRET || 'secret');
    const refreshToken = AuthService.signRefreshToken(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret');

    // Store refresh token in Redis
    await (fastify as any).redis.set(
      `refresh_token:${user.id}`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60
    );

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

  fastify.post('/verify-mfa', async (request, reply) => {
    const { tempToken, code } = request.body as any;
    
    try {
      const payload = AuthService.verifyToken(tempToken, process.env.JWT_SECRET || 'secret') as any;
      if (!payload.pendingMfa) throw new Error('Invalid token');

      const db = request.db;
      const user = await db
        .selectFrom('users')
        .selectAll()
        .where('id', '=', payload.userId)
        .executeTakeFirstOrThrow();

      const isValid = AuthService.verifyMfaToken(code, user.mfa_secret!);
      if (!isValid) return reply.status(401).send({ message: 'Invalid MFA code' });

      // Get associations and issue real tokens
      const userRestaurants = await db
        .selectFrom('user_restaurants')
        .select('restaurant_id')
        .where('user_id', '=', user.id)
        .execute();

      const restaurantIds = userRestaurants.map((ur: any) => ur.restaurant_id);
      
      const fullPayload = {
        userId: user.id,
        role: user.role,
        organizationId: user.organization_id || undefined,
        restaurantIds,
      };

      const accessToken = AuthService.signAccessToken(fullPayload, process.env.JWT_SECRET || 'secret');
      const refreshToken = AuthService.signRefreshToken(fullPayload, process.env.JWT_REFRESH_SECRET || 'refresh-secret');

      await (fastify as any).redis.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

      return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
    } catch (err) {
      return reply.status(401).send({ message: 'MFA Verification failed' });
    }
  });

  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as any;
    try {
      const payload = AuthService.verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
      const storedToken = await (fastify as any).redis.get(`refresh_token:${payload.userId}`);
      
      if (storedToken !== refreshToken) {
        return reply.status(401).send({ message: 'Invalid refresh token' });
      }

      const newAccessToken = AuthService.signAccessToken(payload, process.env.JWT_SECRET || 'secret');
      return { accessToken: newAccessToken };
    } catch (err) {
      return reply.status(401).send({ message: 'Token refresh failed' });
    }
  });

  fastify.post('/signup', async (request, reply) => {
    const { email, password, organizationName, role } = signupSchema.parse(request.body);

    const db = request.db;
    return await db.transaction().execute(async (trx: any) => {
      const existingUser = await trx
        .selectFrom('users')
        .where('email', '=', email)
        .executeTakeFirst();

      if (existingUser) {
        throw new Error('User already exists');
      }

      const org = await trx
        .insertInto('organizations')
        .values({ name: organizationName || 'My Restaurant Group' })
        .returning('id')
        .executeTakeFirstOrThrow();

      const restaurant = await trx
        .insertInto('restaurants')
        .values({ organization_id: org.id, name: 'Default Restaurant' })
        .returning('id')
        .executeTakeFirstOrThrow();

      const passwordHash = await AuthService.hashPassword(password);
      
      const user = await trx
        .insertInto('users')
        .values({
          email,
          password_hash: passwordHash,
          role: role || ROLES.OWNER,
          organization_id: org.id,
          is_active: true,
        })
        .returning(['id', 'email', 'role'])
        .executeTakeFirstOrThrow();

      await trx
        .insertInto('user_restaurants')
        .values({ user_id: user.id, restaurant_id: restaurant.id })
        .execute();

      return { user, organizationId: org.id };
    });
  });

  fastify.post('/logout', async (request, reply) => {
    const user = request.user as any;
    if (user && user.jti) {
      const remainingTtl = 15 * 60; // 15 mins
      await (fastify as any).redis.set(`denylist:${user.jti}`, '1', 'EX', remainingTtl);
      await (fastify as any).redis.del(`refresh_token:${user.userId}`);
    }
    return { message: 'Logged out' };
  });

  fastify.post('/admin-login', async (request, reply) => {
    // Reuse login logic or guard
    const { email, password } = loginSchema.parse(request.body);
    const db = request.db;
    const user = await db.selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst();
    
    if (!user || user.role !== ROLES.SUPER_ADMIN || !(await AuthService.comparePassword(password, user.password_hash))) {
      return reply.status(403).send({ message: 'Admin access denied' });
    }
    
    // Issue token...
    const payload = { userId: user.id, role: user.role, restaurantIds: [] };
    const accessToken = AuthService.signAccessToken(payload, process.env.JWT_SECRET || 'secret');
    return { accessToken, user: { id: user.id, email: user.email, role: user.role } };
  });
}
