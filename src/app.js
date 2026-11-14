import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { config } from './config/index.js';
import db from './config/knex.js';
import errorHandler from './middlewares/errorHandler.js';

import healthRoutes from './modules/health/health.routes.js';
import authenticationRoutes from './modules/authentication/authentication.routes.js';
import usersRoutes from './modules/users/users.routes.js';

/**
 * Builds and configures the Fastify application.
 */
export async function buildApp(opts = {}) {
  const app = Fastify({
    logger: false,
    ...opts
  });

  // Decorate fastify.knex with the shared Knex database instance
  app.decorate('knex', db);

  // CORS configuration
  await app.register(cors, {
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Cookie plugin
  await app.register(cookie);

  // Form body parsing
  await app.register(formbody);

  // Rate limiting
  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute'
  });

  // JWT configuration with session cookie extraction
  await app.register(jwt, {
    secret: config.jwtSecret,
    cookie: {
      cookieName: 'session',
      signed: false
    }
  });

  // Swagger docs (served only in non-production environments)
  if (!config.isProduction) {
    await app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Astra API',
          description: 'Astra Backend API Documentation',
          version: '1.0.0'
        }
      }
    });

    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs'
    });
  }

  // Global Error Handler
  app.setErrorHandler(errorHandler);

  // 404 Handler formatted into { error, statusCode }
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: `Route ${request.method}:${request.url} not found`,
      statusCode: 404
    });
  });

  // Register each module with prefix /api
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authenticationRoutes, { prefix: '/api' });
  await app.register(usersRoutes, { prefix: '/api' });

  return app;
}

export default buildApp;
