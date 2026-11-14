import * as usersService from './users.service.js';

export default {
  getUsers: async (request, reply) => {
    try {
      const result = await usersService.getUsers(
        request.user,
        request.query,
        request.server.knex
      );
      return reply.send({
        message: 'Users retrieved successfully',
        ...result
      });
    } catch (error) {
      request.log.error({ err: error }, 'Error retrieving users');
      throw error;
    }
  }
};

