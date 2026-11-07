import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { Client } = pg;

const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres:123456789@localhost:5432/astra';
const adminEmail = (process.env.ADMIN_SEED_EMAIL || 'admin@example.com').toLowerCase();

async function runSeeds() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database for seeding.');

    await client.query('BEGIN');

    // Insert predefined roles safely
    const roles = ['Student', 'Faculty', 'Admin'];
    for (const role of roles) {
      await client.query(
        `INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [role]
      );
    }
    console.log('Roles seeded: Student, Faculty, Admin.');

    // Retrieve Admin role ID
    const roleResult = await client.query(
      `SELECT id FROM roles WHERE name = 'Admin' LIMIT 1;`
    );

    if (roleResult.rows.length === 0) {
      throw new Error('Admin role was not found after seeding roles.');
    }

    const adminRoleId = roleResult.rows[0].id;

    // Insert admin user safely
    await client.query(
      `INSERT INTO users (email, name, role_id, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (email) DO NOTHING;`,
      [adminEmail, 'Portal Administrator', adminRoleId]
    );
    console.log(`Admin user seeded: ${adminEmail} (Role: Admin, ID: ${adminRoleId}).`);

    await client.query('COMMIT');
    console.log('Database seeding completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeeds();

