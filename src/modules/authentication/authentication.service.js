import { config } from '../../config/index.js';
import { AuthError } from '../../utils/errors.js';
import { signToken } from './jwt.util.js';

/**
 * Exchanges Google OAuth authorization code for Google user profile via native fetch.
 */
export async function exchangeGoogleCode(code) {
  if (!config.google.clientId || !config.google.clientSecret) {
    throw new AuthError('Google OAuth is not configured on this server');
  }

  // 1. Exchange code for access tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: config.google.callbackUrl,
      grant_type: 'authorization_code'
    })
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    throw new AuthError(`Failed to exchange authorization code: ${errorBody}`);
  }

  const tokenData = await tokenResponse.json();

  // 2. Fetch user profile with token
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  if (!profileResponse.ok) {
    throw new AuthError('Failed to fetch user profile from Google');
  }

  return await profileResponse.json();
}

/**
 * Looks up an active user by email from the database.
 * Pure function: receives knex as a parameter and never imports it.
 */
export async function findActiveUserByEmail(email, knex) {
  return await knex('users')
    .select(
      'users.user_id',
      'users.email',
      'users.name',
      'roles.name as role',
      'users.is_active'
    )
    .join('roles', 'roles.role_id', 'users.role_id')
    .where({ 'users.email': email, 'users.is_active': true })
    .first();
}

/**
 * Creates a signed JWT access token for an authenticated user.
 */
export function createSessionToken(fastify, user) {
  return signToken(fastify, {
    user_id: user.user_id,
    email: user.email,
    role: user.role
  });
}

