import controller from './authentication.controller.js';
import {
  googleAuthSchema,
  googleCallbackSchema,
  meSchema,
  logoutSchema
} from './authentication.validation.js';
import { verifyAccessToken } from '../../middlewares/auth.middleware.js';

/**
 * Authentication module routes.
 * Mounted with prefix '/api' in app.js -> /api/auth/*
 */
export default async function authenticationRoutes(fastify, options) {
  // GET /api/auth/google
  fastify.get('/auth/google', { schema: googleAuthSchema }, controller.initiateGoogleAuth);

  // GET /api/auth/callback
  fastify.get('/auth/callback', { schema: googleCallbackSchema }, controller.googleCallback);

  // GET /api/auth/me
  fastify.get('/auth/me', {
    schema: meSchema,
    preHandler: [verifyAccessToken]
  }, controller.me);

  // POST /api/auth/logout
  fastify.post('/auth/logout', {
    schema: logoutSchema,
    preHandler: [verifyAccessToken]
  }, controller.logout);
}

