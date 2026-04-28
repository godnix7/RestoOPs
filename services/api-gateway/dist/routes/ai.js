import { aiChatRequestSchema } from '@restroops/shared';
import { AiOrchestrator } from '../services/aiOrchestrator.js';
export default async function aiRoutes(fastify) {
    fastify.post('/chat', async (request, reply) => {
        const { conversationId, restaurantId, message } = aiChatRequestSchema.parse(request.body);
        const user = request.user;
        if (!user)
            return reply.status(401).send({ message: 'Unauthorized' });
        const result = await AiOrchestrator.handleChat(user.userId, restaurantId, message, conversationId);
        return result;
    });
    fastify.get('/conversations', async (request, reply) => {
        // Implementation for listing recent chats
        return [];
    });
}
