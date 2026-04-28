import { FastifyInstance } from 'fastify';
import { aiChatRequestSchema } from '@restroops/shared';
import { AiOrchestrator } from '../services/aiOrchestrator.js';

export default async function aiRoutes(fastify: FastifyInstance) {
  
  fastify.post('/chat', async (request, reply) => {
    const { conversationId, restaurantId, message } = aiChatRequestSchema.parse(request.body);
    const user = request.user as any;

    if (!user) return reply.status(401).send({ message: 'Unauthorized' });

    const result = await AiOrchestrator.handleChat(
      user.userId,
      restaurantId,
      message,
      conversationId
    );

    return result;
  });

  fastify.get('/conversations', async (request, reply) => {
    // Implementation for listing recent chats
    return [];
  });
}
