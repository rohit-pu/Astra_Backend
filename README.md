# Astra Backend

The backend REST API for the Astra portal built with **Fastify**, **Knex.js**, and **PostgreSQL**.

---

## Features
- **High-Performance Fastify Architecture**: Ultra-low overhead, modern modular plugin and route registration model.
- **Prefix Isolation**: All application routes are mounted under the `/api` prefix.
- **Google OAuth 2.0 Authentication**: Secure native authentication flow using Google Identity Services.
- **Authorization Guard**: Restricts portal access strictly to active users registered in the database.
- **Session Management**: Issues secure `session` cookies or bearer tokens verified via `@fastify/jwt` and `@fastify/cookie`.
- **Role-Based Access Control (RBAC)**: Support for roles (`Student`, `Faculty`, `Admin`) using `authorizeRoles` preHandler hooks.
- **Knex.js Query Builder**: Database connectivity with parameterized queries and pure service functions.
- **Auto-Generated API Documentation**: Swagger UI available at `/docs` during development.
- **Standardized Error Handling**: Unified `{ error, statusCode }` response envelope with PostgreSQL error mapping.

---

## Tech Stack
- **Runtime**: Node.js (v22 LTS or higher)
- **Framework**: Fastify (v5)
- **Database & Driver**: PostgreSQL with `pg` driver and `knex` query builder
- **Plugins**: `@fastify/cors`, `@fastify/cookie`, `@fastify/formbody`, `@fastify/jwt`, `@fastify/rate-limit`, `@fastify/swagger`, `@fastify/swagger-ui`
- **Authentication**: Native Google OAuth 2.0 Authorization Code flow + JWT (`@fastify/jwt`)
- **Testing**: Node.js native test runner (`node --test`)

---

## Prerequisites
1. **Node.js** (v22.0.0 or higher) - [Download Node.js](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) running locally or accessible via network
3. **Google Cloud Console account** for setting up OAuth 2.0 Client IDs.

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── index.js          # App configuration loader and env validation
│   │   └── knex.js           # Shared Knex instance for backend queries
│   ├── middlewares/
│   │   ├── auth.middleware.js# JWT verification (session cookie or Bearer token)
│   │   ├── role.middleware.js# Role-based authorization guard
│   │   └── errorHandler.js   # Global error handler ({ error, statusCode })
│   ├── modules/
│   │   ├── authentication/   # Auth module (routes, controller, service, validation, jwt.util)
│   │   ├── health/           # Health check endpoint (/api/health)
│   │   └── users/            # Users management module (Admin only, /api/users)
│   ├── utils/
│   │   ├── errors.js         # Typed error classes and PG error constants
│   │   └── pagination.util.js# Reusable Knex pagination helper
│   ├── app.js                # Fastify app setup, plugins, /api prefix registration
│   └── server.js             # HTTP server entrypoint
├── tests/
│   └── health.test.js        # Health check injection test (node --test)
├── .env.example              # Sample environment configuration file
├── .gitignore                # Git ignore rules
├── package.json              # Project scripts and dependencies
└── README.md                 # Project documentation
```

---

## Environment Configuration

1. In the `backend` directory, create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Fastify server port | `3000` |
| `HOST` | Fastify listen host | `0.0.0.0` |
| `NODE_ENV` | Runtime environment | `development` |
| `DATABASE_URL` | PostgreSQL connection URI | `postgres://user:password@localhost:5432/astra` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console | (Required for Google Auth) |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret from Google Cloud Console | (Required for Google Auth) |
| `GOOGLE_CALLBACK_URL` | Authorized OAuth redirect URI | `http://localhost:3000/api/auth/callback` |
| `JWT_SECRET` | Secret key used to sign and verify session JWTs | (Required, 32+ character random string) |
| `FRONTEND_URL` | Origin URL of the Angular frontend | `http://localhost:4200` |

> [!IMPORTANT]
> The server enforces a fail-fast startup check: if any of `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, or `JWT_SECRET` is empty, the application prints the missing variable names and exits immediately with code 1.

---

## Database Setup

Database migrations and seeds are managed in the [`database/`](file:///c:/Users/rohit/Desktop/astra/database) package:

```bash
cd ../database
npm install
npm run migrate
npm run seed
```

**Schema Overview:**
- **`roles`**:
  - `role_id` (UUID PRIMARY KEY DEFAULT `gen_random_uuid()`)
  - `name` (VARCHAR(50) UNIQUE NOT NULL) — `Student`, `Faculty`, `Admin`
  - audit columns (`created_by`, `created_date`, `modified_by`, `modified_date`, `ip_address`, `is_active`)
- **`users`**:
  - `user_id` (UUID PRIMARY KEY DEFAULT `gen_random_uuid()`)
  - `email` (VARCHAR(255) UNIQUE NOT NULL)
  - `name` (VARCHAR(255))
  - `role_id` (UUID REFERENCES roles(role_id))
  - audit columns (`created_by`, `created_date`, `modified_by`, `modified_date`, `ip_address`, `is_active`)

---

## Google OAuth Configuration

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** > **Credentials**.
3. Create an **OAuth 2.0 Client ID** (Web application).
4. Add to **Authorized JavaScript origins**: `http://localhost:3000`, `http://localhost:4200`
5. Add to **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback`

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

### Testing
```bash
npm test
```

Once running, the backend API is accessible at `http://localhost:3000`. Swagger documentation is available at `http://localhost:3000/docs` in development.

---

## API Endpoints Reference

All routes are prefixed with `/api`.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Health check endpoint returning `{ message: "ok" }` | No |
| `GET` | `/api/auth/google` | Initiates Google OAuth consent screen | No |
| `GET` | `/api/auth/callback` | OAuth callback URI; sets `session` cookie and redirects | No |
| `GET` | `/api/auth/me` | Returns profile details and role of current user | Yes (`session` cookie or Bearer token) |
| `POST` | `/api/auth/logout` | Clears `session` cookie and terminates session | Yes (`session` cookie or Bearer token) |
| `GET` | `/api/users` | List users with pagination and search | Yes (`Admin` role) |

---

## Authentication & Authorization Flow

1. User clicks **Sign in with Google** on the frontend, navigating to `/api/auth/google`.
2. The user authenticates with Google and is redirected to `/api/auth/callback?code=...`.
3. The backend exchanges the code for the user's email via native fetch.
4. The backend queries the `users` table:
   - If the user exists and `is_active === true`:
     - Signs a JWT containing `{ user_id, email, role }`.
     - Sets the `session` cookie (`httpOnly`, `sameSite: 'lax'`, `path: '/'`).
     - Redirects to `${FRONTEND_URL}/dashboard`.
   - If not registered or inactive:
     - Redirects to `${FRONTEND_URL}/login?error=access_denied`.
