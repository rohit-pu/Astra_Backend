import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Fastify preHandler hook to verify JWT stored in the 'session' httpOnly cookie.
 */
export async function requireAuth(request, reply) {
  const token = request.cookies?.session;

  if (!token) {
    return reply.status(401).send({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid or expired session' });
  }
}

/**
 * Fastify preHandler hook to restrict access by user role.
 */
export function requireRole(...roles) {
  return async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'Forbidden: Insufficient permissions' });
    }
  };
}
