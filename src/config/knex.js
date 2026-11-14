import knex from 'knex';
import { config } from './index.js';

/**
 * Shared Knex instance for backend queries.
 */
export const db = knex({
  client: 'pg',
  connection: config.databaseUrl
});

export default db;

