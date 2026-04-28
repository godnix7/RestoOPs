import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

export function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // 1. Log Error
    request.log.error(error);

    // 2. Handle Zod Validation Errors
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation Failed',
        errors: error.errors,
      });
    }

    // 3. Handle Unauthorized
    if (error.statusCode === 401) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    // 4. Fallback for Internal Errors
    reply.status(error.statusCode || 500).send({
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : error.message,
      code: error.code,
    });
  });
}
