import { createDb } from '@restroops/db';
export class AiOrchestrator {
    static async handleChat(userId, restaurantId, message, conversationId) {
        const db = createDb(process.env.DATABASE_URL || '');
        // 1. Resolve or Create Conversation
        let currentConversationId = conversationId;
        if (!currentConversationId) {
            const result = await db
                .insertInto('ai_conversations')
                .values({
                user_id: userId,
                restaurant_id: restaurantId,
                title: message.substring(0, 50) + '...',
            })
                .returning('id')
                .executeTakeFirstOrThrow();
            currentConversationId = result.id;
        }
        // 2. Persist User Message
        await db
            .insertInto('ai_messages')
            .values({
            conversation_id: currentConversationId,
            role: 'user',
            content: message,
        })
            .execute();
        // 3. Logic for Tool-Calling & LLM Interaction (Simplified for now)
        // In a real implementation, we would call Gemini/OpenAI here.
        const responseContent = await this.generateResponse(message, restaurantId);
        // 4. Persist Assistant Message
        const assistantMsg = await db
            .insertInto('ai_messages')
            .values({
            conversation_id: currentConversationId,
            role: 'assistant',
            content: responseContent,
            metadata: {
                suggestedActions: ['Check Payroll', 'View P&L']
            }
        })
            .returningAll()
            .executeTakeFirstOrThrow();
        return {
            conversationId: currentConversationId,
            message: assistantMsg,
        };
    }
    static async generateResponse(input, restaurantId) {
        // This is where the magic happens (LLM + Context Tools)
        if (input.toLowerCase().includes('payroll')) {
            return "I've analyzed your current payroll. There's one anomaly: Jane Smith has 68 hours logged this week, which is above your safety threshold.";
        }
        return "I'm the RestroOps Auditor. I can help you analyze your finances, payroll, and business performance. What would you like to know?";
    }
}
