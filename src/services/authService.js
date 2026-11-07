import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Generate a signed JWT for authenticated user sessions.
 */
export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' });
}
