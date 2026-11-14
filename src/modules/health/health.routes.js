/**
 * Health check module routes.
 */
export default async function healthRoutes(fastify, options) {
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Service health check endpoint',
      description: 'Returns ok if service is active and listening',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return reply.status(200).send({ message: 'ok' });
  });
}

