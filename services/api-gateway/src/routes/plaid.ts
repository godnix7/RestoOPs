import { FastifyInstance } from 'fastify';
import { plaidExchangeTokenSchema } from '@restroops/shared';
import { PlaidService } from '../services/plaidService.js';

export default async function plaidRoutes(fastify: FastifyInstance) {
  
  fastify.post('/create-link-token', async (request, reply) => {
    const { restaurantId } = request.body as any;
    const user = request.user as any;
    
    const tokenData = await PlaidService.createLinkToken(user.userId, restaurantId);
    return tokenData;
  });

  fastify.post('/exchange-token', async (request, reply) => {
    const { publicToken, restaurantId } = plaidExchangeTokenSchema.parse(request.body);
    
    await PlaidService.exchangePublicToken(publicToken, restaurantId);
    return { success: true };
  });

  fastify.post('/sync', async (request, reply) => {
    const { restaurantId } = request.body as any;
    const result = await PlaidService.syncTransactions(restaurantId);
    return result;
  });
}
