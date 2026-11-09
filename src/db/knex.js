import knex from 'knex';
import { config } from '../config/index.js';

/**
 * Shared Knex instance for backend queries.
 */
export const db = knex({
  client: 'pg',
  connection: config.databaseUrl
});

export default db;

