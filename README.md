# Astra Backend

Astra Backend is an academic and student management REST API built with Node.js, Express, PostgreSQL, and Google OAuth 2.0 authentication.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Database Setup & Migrations](#database-setup--migrations)
- [Google OAuth Configuration](#google-oauth-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints Reference](#api-endpoints-reference)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Troubleshooting](#troubleshooting)

---

## Features
- **Google OAuth 2.0 Authentication**: Secure authentication flow with Google Identity Services.
- **Authorization Guard**: Restricts portal access only to active users pre-registered in the database.
- **JWT Session Management**: Issues secure, `httpOnly`, `sameSite: 'lax'` cookies for seamless frontend integration.
- **Role-Based Access Control (RBAC)**: Support for multiple roles (`Student`, `Faculty`, `Admin`).
- **PostgreSQL Database Pool**: Resilient database connectivity with error handling and query logging.
- **Modular Architecture**: Layered architecture separating controllers, services, middleware, and database access.

---

## Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4)
- **Database & Query Builder**: PostgreSQL with `pg` and `knex` (query builder)
- **Authentication**: `google-auth-library`, `passport`, `passport-google-oauth20`, `jsonwebtoken`
- **Utilities**: `cookie-parser`, `cors`, `dotenv`

---

## Prerequisites
Before setting up the backend, ensure you have the following installed:
1. **Node.js** (v18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) running locally or accessible via network - [Download PostgreSQL](https://www.postgresql.org/download/)
3. **Google Cloud Console account** for setting up OAuth 2.0 Client IDs.

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── index.js          # App configuration loader and env validation
│   │   └── passport.js       # Passport Google OAuth strategy configuration
│   ├── controllers/
│   │   └── authController.js # Auth endpoints (login, Google callback, logout, me)
│   ├── db/
│   │   └── knex.js           # Shared Knex instance for backend queries
│   ├── middleware/
│   │   └── auth.js           # JWT authentication and role authorization middleware
│   ├── routes/
│   │   ├── authRoutes.js     # Auth route declarations
│   │   └── index.js          # Main API router aggregator
│   ├── services/
│   │   ├── authService.js    # Authentication tokens & session generation
│   │   └── userService.js    # Knex query builder queries for active users
│   ├── app.js                # Express app setup, CORS, and middleware stack
│   └── server.js             # HTTP server entrypoint
├── .env.example              # Sample environment configuration file
├── .gitignore                # Git ignore rules (strictly ignores secrets and node_modules)
├── package.json              # Project scripts and dependencies
└── README.md                 # Project documentation
```

---

## Environment Configuration

1. In the `backend` directory, create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port number the backend server listens on | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://postgres:password@localhost:5432/astra` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Web Client ID from Google Cloud Console | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Web Client Secret from Google Cloud Console | `GOCSPX-xxxx` |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI registered in Google Console | `http://localhost:3000/auth/google/callback` |
| `FRONTEND_URL` | URL of the Angular frontend | `http://localhost:4200` |
| `JWT_SECRET` | Secret key used to sign session JWTs | A secure random string |
| `ADMIN_SEED_EMAIL` | Email seeded with Admin role during initial setup | `your-email@example.com` |

> [!CAUTION]
> Never commit `.env` containing sensitive credentials or passwords to version control.

---

## Database Setup & Migrations

Database schema migrations and seed data are managed independently in the `database/` package via Knex.js CLI. The `backend/` service connects to the database via its shared Knex instance solely to run application queries.

### 1. Create PostgreSQL Database
Connect to your local PostgreSQL instance and create the database:
```sql
CREATE DATABASE astra;
```

### 2. Run Database Migrations and Seeds
From the `database/` folder:
```bash
cd ../database
npm install

# Run migrations
npm run migrate

# Roll back migrations if needed
npm run migrate:rollback

# Seed roles and admin user
npm run seed
```

**Schema Overview:**
- **`roles`**:
  - `id` (SERIAL PRIMARY KEY)
  - `name` (TEXT UNIQUE NOT NULL) — e.g., `Student`, `Faculty`, `Admin`
- **`users`**:
  - `id` (SERIAL PRIMARY KEY)
  - `email` (TEXT UNIQUE NOT NULL)
  - `name` (TEXT)
  - `role_id` (INT REFERENCES roles(id))
  - `is_active` (BOOLEAN DEFAULT TRUE)
  - `created_at` (TIMESTAMPTZ DEFAULT NOW())

---

## Google OAuth Configuration

To enable Google sign-in:
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** > **Credentials**.
3. Create an **OAuth 2.0 Client ID** with application type **Web Application**.
4. Configure the following URIs:
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:4200`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/google/callback`
5. Copy the generated **Client ID** and **Client Secret** into your `backend/.env` file.

---

## Running the Application

### Development Mode (with hot-reloading)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Once running, the backend API is accessible at `http://localhost:3000`.

---

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/auth/google` | Initiates Google OAuth consent screen | No |
| `GET` | `/auth/google/callback` | OAuth callback URI; validates credentials, queries DB user, sets cookie, redirects | No |
| `GET` | `/auth/me` | Returns details and role of current authenticated user | Yes (JWT cookie) |
| `POST` | `/auth/logout` | Clears `auth_token` cookie and terminates session | Yes (JWT cookie) |

### Health Check

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` or `/health` | API health check and operational status | No |

---

## Role-Based Access Control (RBAC)

When a user logs in via Google:
1. The backend verifies the Google profile and extracts their email address.
2. The backend queries the `users` table via `userService.findActiveUserByEmail(email)`.
3. If the user is found and `is_active === true`:
   - An `auth_token` JWT cookie is created containing `id`, `email`, and `role`.
   - The user is redirected to `${FRONTEND_URL}/dashboard`.
4. If the user is **not found** or **inactive**:
   - Access is rejected.
   - The user is redirected to `${FRONTEND_URL}/login?error=access_denied`.

---

## Troubleshooting

- **`ECONNREFUSED 127.0.0.1:5432`**:
  - PostgreSQL server is not running or port 5432 is blocked. Check the PostgreSQL service in Windows Services or run `pg_ctl start`.
- **`Error 401: invalid_client` on Google Sign-In**:
  - Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` match your Google Cloud Console credentials.
- **`redirect_uri_mismatch`**:
  - Ensure `http://localhost:3000/auth/google/callback` is listed under **Authorized redirect URIs** in Google Cloud Console.
- **`This Google account is not authorised to access the portal`**:
  - The email logging in has not been added to the database. Run `npm run seed` with `ADMIN_SEED_EMAIL` set to your Google account email, or insert the user record directly into PostgreSQL:
    ```sql
    INSERT INTO users (email, name, role_id, is_active)
    VALUES ('your-email@example.com', 'Your Name', 3, true);
    ```
