import controller from './users.controller.js';
import { getUsersSchema } from './users.validation.js';
import { verifyAccessToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

/**
 * Users module routes.
 * Mounted with prefix '/api' in app.js -> /api/users
 */
export default async function usersRoutes(fastify, options) {
  fastify.get('/users', {
    schema: getUsersSchema,
    preHandler: [verifyAccessToken, authorizeRoles('Admin')]
  }, controller.getUsers);
}

