/**
 * JSON Schema definitions for Authentication endpoints.
 */

export const googleAuthSchema = {
  tags: ['Authentication'],
  summary: 'Initiate Google OAuth 2.0 login flow',
  description: 'Redirects browser to Google OAuth consent screen',
  response: {
    302: {
      type: 'null',
      description: 'Redirect to Google OAuth consent screen'
    }
  }
};

export const googleCallbackSchema = {
  tags: ['Authentication'],
  summary: 'Google OAuth 2.0 authorization callback',
  description: 'Handles redirect from Google, validates credentials, sets session cookie',
  querystring: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      error: { type: 'string' },
      state: { type: 'string' }
    }
  },
  response: {
    302: {
      type: 'null',
      description: 'Redirects to frontend dashboard or login error page'
    }
  }
};

export const meSchema = {
  tags: ['Authentication'],
  summary: 'Retrieve authenticated user session profile',
  description: 'Returns profile details for the currently authenticated session',
  response: {
    200: {
      type: 'object',
      properties: {
        user_id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        name: { type: ['string', 'null'] },
        role: { type: 'string' }
      },
      required: ['user_id', 'email', 'role']
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        statusCode: { type: 'integer' }
      }
    }
  }
};

export const logoutSchema = {
  tags: ['Authentication'],
  summary: 'Log out authenticated user and clear session cookie',
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        statusCode: { type: 'integer' }
      }
    }
  }
};

