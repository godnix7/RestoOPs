import Fastify from 'fastify';
import cors from '@fastify/cors';
import redis from '@fastify/redis';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import policyRoutes from './routes/policies.js';
import dashboardRoutes from './routes/dashboard.js';
import payrollRoutes from './routes/payroll.js';
import aiRoutes from './routes/ai.js';
import { authenticate } from './middleware/auth.js';
import { enforcePolicyAcceptance } from './middleware/policyGate.js';
dotenv.config();
const fastify = Fastify({
    logger: true
});
// Register Plugins
fastify.register(cors, {
    origin: true
});
fastify.register(redis, {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
});
// Global Hooks
fastify.addHook('preHandler', async (request, reply) => {
    if (request.url.startsWith('/auth') || request.url === '/health')
        return;
    await authenticate(request, reply);
    await enforcePolicyAcceptance(request, reply);
});
// Register Routes
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(policyRoutes, { prefix: '/policies' });
fastify.register(dashboardRoutes, { prefix: '/dashboard' });
fastify.register(payrollRoutes, { prefix: '/payroll' });
fastify.register(aiRoutes, { prefix: '/ai' });
// Health Check
fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});
// Start Server
const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3001');
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 RestroOps API Gateway running at http://localhost:${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
