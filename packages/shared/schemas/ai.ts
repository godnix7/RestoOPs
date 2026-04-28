import { z } from 'zod';

export const aiChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const aiChatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  restaurantId: z.string().uuid(),
  message: z.string(),
});

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;
export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

export const aiConversationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  lastMessage: z.string().optional(),
  updatedAt: z.string(),
});

export type AiConversation = z.infer<typeof aiConversationSchema>;
