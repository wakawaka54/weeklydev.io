import { authenticateUser, verifyUniqueUser } from './util.js';
import createUserSchema from '../../Schemas/User.js';
import * as users from './users.js';

const routes = [
  /**
  * Login
  */
  {
    method: 'POST',
    path: '/login',
    config: {
      pre: [{
        method: authenticateUser,
        assign: 'user'
      }],
      auth: 'userPass' // Requires basic auth (username:password)
    },
    handler: users.login
  },

  /**
  * Logout
  */
  {
    method: 'get',
    path: '/logout',
    config: {
      auth: 'jwt'
    },
    handler: users.logout
  },

  /*
  * Create a new user
  */
  {
    method: 'POST',
    path: '/users/new',
    config: {
      validate: {
        payload: createUserSchema
      },
      // Before the route handler runs, verify that
      // the user is unique and assign the result to 'user'
      pre: [{
        method: verifyUniqueUser,
        assign: 'user'
      }],
      // to register user does not need any authentication
      auth: false
    },
    handler: users.addUser
  },

  /**
   * Get all users
   */
  {
    method: 'GET',
    path: '/users',
    config: {
      auth: 'jwt'
    },
    handler: users.getUsers
  },

  /**
   * Update user by ID
   */
  {
    method: 'PUT',
    path: '/users/{id}',
    config: {
      auth: {
        scope: ['user-{params.id}', 'admin']
      }
    },
    handler: users.updateUser
  },

  {
    /**
     * Get users one user by id
     */
    method: 'GET',
    path: '/users/{id}',
    config: {
      auth: 'jwt'
    },
    handler: users.getUser
  },

  /**
   * Update user by ID
   */
  {
    method: 'DELETE',
    path: '/users/{id}',
    config: {
      auth: {
        scope: ['user-{params.id}', 'admin']
      }
    },
    handler: users.deleteUser
  },

  /**
   * Get user by request id
   */
  {
    method: 'GET',
    path: '/users/me',
    config: {
      auth: 'jwt'
    },
    handler: users.getCurrentUser
  },

  /**
   * Get user by request id
   */
  {
    method: 'GET',
    path: '/users/me/teams',
    config: {
      auth: 'jwt'
    },
    handler: users.getTeamsIn
  },
  {
    /**
     * Get user by request id
     */
    method: 'GET',
    path: '/match/join',
    config: {
      auth: 'jwt'
    },
    handler: users.joinMatchmaking
  },
  {
    /**
     * Get user by request id
     */
    method: 'GET',
    path: '/match/teams',
    handler: users.getGhostTeams
  },
  {
    method: 'get',
    path: '/admin{id?}',
    config: {
      auth: {
        scope: ['admin']
      }
    },
    handler: users.adminTest
  },
  {
    method: 'GET',
    path: '/users/confirm/{TOKEN}',
    config: {
      auth: false
    },
    handler: users.confirmUserAccount
  }

];

export default routes;
