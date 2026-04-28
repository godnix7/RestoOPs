import { FastifyInstance } from 'fastify';
import { QuickBooksService } from '../services/quickbooksService.js';

export default async function quickbooksRoutes(fastify: FastifyInstance) {
  
  fastify.post('/sync', async (request, reply) => {
    const { restaurantId } = request.body as any;
    const result = await QuickBooksService.syncExpenses(restaurantId);
    return result;
  });

  // OAuth 2.0 Callback & Link logic would go here
}
