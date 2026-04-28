import { FastifyInstance } from 'fastify';
import { BillingService } from '../services/billingService.js';
import { z } from 'zod';

const checkoutSchema = z.object({
  restaurantId: z.string().uuid(),
  priceId: z.string(),
});

export default async function billingRoutes(fastify: FastifyInstance) {
  
  fastify.post('/checkout', async (request, reply) => {
    const { restaurantId, priceId } = checkoutSchema.parse(request.body);
    const session = await BillingService.createCheckoutSession(restaurantId, priceId);
    return { url: session.url };
  });

  fastify.post('/webhook', { config: { rawBody: true } }, async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    return await BillingService.handleWebhook(request.body, sig);
  });
}
