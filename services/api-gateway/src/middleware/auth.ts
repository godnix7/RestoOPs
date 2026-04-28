import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService, TokenPayload } from '@restroops/auth';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = AuthService.verifyToken(token, process.env.JWT_SECRET || 'secret');
    
    // Check Redis denylist for jti
    if (payload.jti) {
      const isDenylisted = await (request.server as any).redis.get(`denylist:${payload.jti}`);
      if (isDenylisted) {
        return reply.status(401).send({ message: 'Token revoked' });
      }
    }

    request.user = payload;
  } catch (err) {
    return reply.status(401).send({ message: 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as TokenPayload;

    if (!user || !roles.includes(user.role)) {
      return reply.status(403).send({ message: 'Forbidden' });
    }
  };
};

export const scopeToRestaurant = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as TokenPayload;
  const restaurantId = (request.params as any).restaurantId || (request.query as any).restaurantId;

  if (!restaurantId) return;

  if (user.role !== 'super_admin' && !user.restaurantIds.includes(restaurantId)) {
    return reply.status(403).send({ message: 'Access denied to this restaurant' });
  }
};

// Extend FastifyRequest type
declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}
