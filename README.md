# Astra Backend

Astra is an academic and student management platform backend powered by Express, PostgreSQL, and Google OAuth 2.0.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (pg client)
- **Authentication**: Google OAuth 2.0 (`google-auth-library`), JWT (`jsonwebtoken`), Cookie-Parser
- **CORS**: Configured for Angular frontend (`http://localhost:4200`)

## Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally or remotely

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your database and Google OAuth credentials:
   ```bash
   cp .env.example .env
   ```

   Key configuration values in `.env`:
   - `PORT`: Server port (default: `3000`)
   - `DATABASE_URL`: PostgreSQL connection string (e.g. `postgres://postgres:password@localhost:5432/astra`)
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `GOOGLE_CALLBACK_URL`: `http://localhost:3000/auth/google/callback`
   - `FRONTEND_URL`: `http://localhost:4200`
   - `JWT_SECRET`: Random secret string for JWT signing
   - `ADMIN_SEED_EMAIL`: Email of initial administrator (e.g. your Google account email)

3. **Database Migration & Seeding:**
   Run the migration script to create tables (`roles`, `users`, etc.):
   ```bash
   npm run migrate
   ```

   Run the seed script to seed roles (`Student`, `Faculty`, `Admin`) and create the primary admin user:
   ```bash
   npm run seed
   ```

4. **Start the server:**
   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```

The backend API will be available at `http://localhost:3000`.
