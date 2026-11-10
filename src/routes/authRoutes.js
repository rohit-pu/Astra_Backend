import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Fastify routes plugin for authentication endpoints.
 */
export default async function authRoutes(fastify, options) {
  // Start Google OAuth flow
  fastify.get('/google', authController.initiateGoogleAuth);

  // Google OAuth callback
  fastify.get('/callback', authController.googleCallback);

  // Current user profile
  fastify.get('/me', { preHandler: [requireAuth] }, authController.me);

  // Log out and clear session cookie
  fastify.post('/logout', authController.logout);
}
