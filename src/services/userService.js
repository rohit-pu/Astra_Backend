import { pool } from '../db/pool.js';

/**
 * Find an active user by email, joining their role name.
 * Only users with is_active = true are returned.
 */
export async function findActiveUserByEmail(email) {
  const query = `
    SELECT u.id, u.email, u.name, u.is_active, r.name AS role
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE LOWER(u.email) = LOWER($1) AND u.is_active = true
    LIMIT 1;
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

