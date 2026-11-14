import { paginateQuery } from '../../utils/pagination.util.js';

/**
 * Retrieve paginated users list from database.
 * Pure function: receives knex as parameter and never imports it.
 */
export async function getUsers(user, filters, knex) {
  const query = knex('users as u')
    .select(
      'u.user_id',
      'u.email',
      'u.name',
      'r.name as role',
      'u.is_active',
      'u.created_date'
    )
    .join('roles as r', 'r.role_id', 'u.role_id')
    .orderBy('u.created_date', 'desc');

  if (filters.search) {
    query.where((qb) => {
      qb.where('u.email', 'ilike', `%${filters.search}%`)
        .orWhere('u.name', 'ilike', `%${filters.search}%`);
    });
  }

  return await paginateQuery(query, filters.page, filters.limit);
}

