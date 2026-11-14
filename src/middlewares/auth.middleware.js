import { AuthError } from '../utils/errors.js';

/**
 * Verifies JWT token from 'session' cookie or Authorization Bearer header.
 * Populates request.user with { user_id, email, role }.
 */
export async function verifyAccessToken(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    throw new AuthError('Authentication required');
  }
}

