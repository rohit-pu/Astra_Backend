import { config } from '../../config/index.js';
import * as authService from './authentication.service.js';

export default {
  initiateGoogleAuth: async (request, reply) => {
    try {
      if (!config.google.clientId || !config.google.clientSecret) {
        return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
      }

      const params = new URLSearchParams({
        client_id: config.google.clientId,
        redirect_uri: config.google.callbackUrl,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account'
      });

      return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    } catch (error) {
      request.log.error({ err: error }, 'Error initiating Google OAuth');
      throw error;
    }
  },

  googleCallback: async (request, reply) => {
    try {
      const { code, error } = request.query;

      if (error || !code) {
        return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
      }

      let profile;
      try {
        profile = await authService.exchangeGoogleCode(code);
      } catch (err) {
        request.log.warn({ err }, 'Google code exchange failed');
        return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
      }

      const user = await authService.findActiveUserByEmail(profile.email, request.server.knex);

      if (!user) {
        return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
      }

      const token = authService.createSessionToken(request.server, user);

      reply.setCookie('session', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: config.isProduction,
        maxAge: 24 * 60 * 60 // 1 day
      });

      return reply.redirect(`${config.frontendUrl}/dashboard`);
    } catch (error) {
      request.log.error({ err: error }, 'Error in Google callback');
      return reply.redirect(`${config.frontendUrl}/login?error=access_denied`);
    }
  },

  me: async (request, reply) => {
    try {
      const user = await authService.findActiveUserByEmail(request.user.email, request.server.knex);
      if (!user) {
        return reply.status(401).send({ error: 'User no longer active', statusCode: 401 });
      }

      return reply.send({
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error retrieving profile');
      throw error;
    }
  },

  logout: async (request, reply) => {
    try {
      reply.clearCookie('session', { path: '/' });
      return reply.send({ message: 'Logged out successfully' });
    } catch (error) {
      request.log.error({ err: error }, 'Error logging out');
      throw error;
    }
  }
};

