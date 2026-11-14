/**
 * JSON Schema definitions for Users endpoints.
 */

export const getUsersSchema = {
  tags: ['Users'],
  summary: 'Retrieve paginated list of users (Admin only)',
  description: 'Requires authenticated session with Admin role. Supports pagination and search filters.',
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user_id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              name: { type: ['string', 'null'] },
              role: { type: 'string' },
              is_active: { type: 'boolean' },
              created_date: { type: 'string' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            current_page: { type: 'integer' },
            page_size: { type: 'integer' },
            total_records: { type: 'integer' },
            total_pages: { type: 'integer' },
            has_next: { type: 'boolean' },
            has_previous: { type: 'boolean' }
          }
        }
      }
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        statusCode: { type: 'integer' }
      }
    },
    403: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        statusCode: { type: 'integer' }
      }
    }
  }
};

