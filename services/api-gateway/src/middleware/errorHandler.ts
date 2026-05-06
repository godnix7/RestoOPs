import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

export function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // 1. Log Error
    request.log.error(error);

    // 2. Handle Zod Validation Errors
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Validation Failed',
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }

    // 3. Handle Unauthorized
    if (error.statusCode === 401) {
      return reply.status(401).send({
        success: false,
        message: 'Unauthorized',
        data: null,
        error: {
          code: 'UNAUTHORIZED',
        },
      });
    }

    // 4. Fallback for Internal Errors
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : error.message,
      data: null,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'production' ? undefined : error.stack
      },
    });
  });
}

