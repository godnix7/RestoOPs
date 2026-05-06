import { FastifyInstance } from 'fastify';
import { aiChatRequestSchema } from '@restroops/shared';
import { AiOrchestrator } from '../services/aiOrchestrator.js';

export default async function aiRoutes(fastify: FastifyInstance) {
  
  fastify.post('/chat', async (request, reply) => {
    const { conversationId, restaurantId, message } = aiChatRequestSchema.parse(request.body);
    const user = request.user as any;

    if (!user) return reply.status(401).send({ 
      success: false,
      message: 'Unauthorized',
      data: null,
      error: { code: 'UNAUTHORIZED' }
    });

    const result = await AiOrchestrator.handleChat(
      user.userId,
      restaurantId,
      message,
      conversationId
    );

    return {
      success: true,
      message: 'Chat processed',
      data: result,
      error: null
    };
  });

  fastify.get('/conversations', async (request, reply) => {
    return {
      success: true,
      message: 'Conversations retrieved',
      data: [],
      error: null
    };
  });
}

