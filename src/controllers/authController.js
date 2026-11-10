import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { findActiveUserByEmail } from '../services/userService.js';
import { generateToken } from '../services/authService.js';

/**
 * Initiates the Google OAuth 2.0 flow by redirecting the user to Google.
 */
export async function initiateGoogleAuth(request, reply) {
  if (!config.google.clientId || !config.google.clientSecret) {
    console.warn('Google OAuth is not configured. Redirecting to access_denied.');
    return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
  }

  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.callbackUrl,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'select_account'
  });

  return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

/**
 * Handles the Google OAuth 2.0 callback, exchanges authorization code for profile,
 * verifies active portal user status, and sets the session cookie.
 */
export async function googleCallback(request, reply) {
  const { code, error } = request.query;

  if (error || !code) {
    return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
  }

  try {
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
      console.error('Google token exchange failed:', await tokenResponse.text());
      return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
    }

    const tokenData = await tokenResponse.json();

    let email = null;
    if (tokenData.id_token) {
      const decoded = jwt.decode(tokenData.id_token);
      email = decoded?.email?.toLowerCase();
    }

    if (!email && tokenData.access_token) {
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (userinfoRes.ok) {
        const profile = await userinfoRes.json();
        email = profile.email?.toLowerCase();
      }
    }

    if (!email) {
      return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
    }

    // Only active users in the database are allowed to sign in
    const user = await findActiveUserByEmail(email);

    if (!user) {
      return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    reply.setCookie('session', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
      maxAge: 24 * 60 * 60 // 1 day in seconds
    });

    return reply.redirect(`${config.frontendUrl}/dashboard`);
  } catch (err) {
    console.error('Error during authentication callback:', err);
    return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
  }
}

/**
 * Returns current authenticated user profile.
 */
export async function me(request, reply) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  return reply.send({
    id: request.user.id,
    email: request.user.email,
    role: request.user.role
  });
}

/**
 * Clears the session cookie to log out the user.
 */
export async function logout(request, reply) {
  reply.clearCookie('session', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction
  });

  return reply.send({ message: 'Logged out successfully' });
}
