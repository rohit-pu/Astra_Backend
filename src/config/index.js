import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from backend directory as well as current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Validate required environment variables on startup
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variable(s): ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    'Warning: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google OAuth will redirect with access_denied until configured.'
  );
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/astra',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/callback'
  },
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  isProduction: process.env.NODE_ENV === 'production'
};
