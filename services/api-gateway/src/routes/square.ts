import { FastifyInstance } from 'fastify';
import { SquareService } from '../services/squareService.js';
import { z } from 'zod';

const linkSquareSchema = z.object({
  restaurantId: z.string().uuid(),
  accessToken: z.string(),
  locationIds: z.array(z.string()),
});

export default async function squareRoutes(fastify: FastifyInstance) {
  
  fastify.post('/link', async (request, reply) => {
    const { restaurantId, accessToken, locationIds } = linkSquareSchema.parse(request.body);
    await SquareService.linkAccount(restaurantId, accessToken, locationIds);
    return { success: true };
  });

  fastify.post('/sync', async (request, reply) => {
    const { restaurantId } = request.body as any;
    const result = await SquareService.syncSales(restaurantId);
    return result;
  });
}
