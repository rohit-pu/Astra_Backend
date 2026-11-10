import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import { config } from './config/index.js';
import routes from './routes/index.js';

/**
 * Builds and configures the Fastify application.
 */
export async function buildApp(opts = {}) {
  const app = Fastify({
    logger: false,
    ...opts
  });

  // CORS configuration for frontend integration
  await app.register(cors, {
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Cookie plugin for HTTP-only session cookies
  await app.register(cookie);

  // Form body parsing for urlencoded payloads
  await app.register(formbody);

  // Register all application routes
  await app.register(routes);

  return app;
}

export default buildApp;
