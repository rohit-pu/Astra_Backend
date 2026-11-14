import { ForbiddenError, AuthError } from '../utils/errors.js';

/**
 * Role authorization guard middleware.
 * Verifies that the authenticated user possesses one of the allowed roles.
 */
export function authorizeRoles(...roles) {
  const allowedRoles = roles.flat();
  return async function roleGuard(request, reply) {
    if (!request.user) {
      throw new AuthError('Authentication required');
    }
    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}

