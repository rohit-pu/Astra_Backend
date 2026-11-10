import authRoutes from './authRoutes.js';

/**
 * Root route aggregator plugin for Fastify.
 */
export default async function rootRoutes(fastify, options) {
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return reply.status(200).send('ok');
  });

  // Authentication routes mounted at /auth
  await fastify.register(authRoutes, { prefix: '/auth' });
}
