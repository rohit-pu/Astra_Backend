import crypto from 'crypto';
import { PG } from '../utils/errors.js';

/**
 * Global Fastify error handler.
 * Formats all errors into { error: string, statusCode: number }.
 */
export function errorHandler(error, request, reply) {
  // 1. Fastify validation errors
  if (error.validation) {
    const details = error.validation.map((v) => v.message).join('; ');
    return reply.status(400).send({
      error: `Validation error: ${details || error.message}`,
      statusCode: 400
    });
  }

  // 2. PostgreSQL specific errors
  if (error.code === PG.UNIQUE_VIOLATION) {
    return reply.status(409).send({
      error: 'A record with this unique identifier already exists',
      statusCode: 409
    });
  }

  if (error.code === PG.FOREIGN_KEY_VIOLATION) {
    return reply.status(400).send({
      error: 'Referenced foreign record does not exist',
      statusCode: 400
    });
  }

  if (error.code === PG.INVALID_TEXT_REPRESENTATION) {
    return reply.status(400).send({
      error: 'Invalid input format (e.g. malformed UUID)',
      statusCode: 400
    });
  }

  // 3. Known application errors with explicit statusCode (e.g. 401, 403, 404, 409)
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      error: error.message || 'Client error',
      statusCode: error.statusCode
    });
  }

  // 4. Fastify notFound 404
  if (reply.statusCode === 404 || error.statusCode === 404) {
    return reply.status(404).send({
      error: error.message || 'Route not found',
      statusCode: 404
    });
  }

  // 5. Unknown 500 errors — log with reference id and mask details
  const refId = crypto.randomUUID().slice(0, 8);
  if (request.log) {
    request.log.error({ err: error, refId }, 'Unhandled server error');
  } else {
    console.error(`Unhandled server error [ref: ${refId}]:`, error);
  }

  return reply.status(500).send({
    error: `Internal server error (ref: ${refId})`,
    statusCode: 500
  });
}

export default errorHandler;

