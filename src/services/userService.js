import { db } from '../db/knex.js';

/**
 * Find an active user by email, joining their role name.
 * Only users with is_active = true are returned.
 *
 * @param {string} email
 * @returns {Promise<{id: number, email: string, name: string, is_active: boolean, role: string} | null>}
 */
export async function findActiveUserByEmail(email) {
  if (!email) return null;

  const user = await db('users as u')
    .leftJoin('roles as r', 'u.role_id', 'r.id')
    .select(
      'u.id',
      'u.email',
      'u.name',
      'u.is_active',
      'r.name as role'
    )
    .whereRaw('LOWER(u.email) = LOWER(?)', [email])
    .andWhere('u.is_active', true)
    .first();

  return user || null;
}
