/**
 * JWT sign and verify wrappers using Fastify instance.
 */

export function signToken(fastify, payload, options = {}) {
  return fastify.jwt.sign(payload, { expiresIn: '1d', ...options });
}

export function verifyToken(fastify, token) {
  return fastify.jwt.verify(token);
}

