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
      description: 'Login',
      notes: `Uses Basic Auth for logint in this requries \`Authorization\` Header with the contents of \`Basic \`+ base64 encoded \`username:password\`.

Example would be \`Basic dGVzdDp0ZXN0\`.

This returns user info and valid token used later in most of the paths as authorization for the user.`,
      tags: ['api', 'login', 'token'],
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
      auth: 'jwt',
      description: 'Logout',
      notes: 'Providing a valid *Token* would invalidate it.',
      tags: ['api', 'logout', 'token']
    },
    handler: users.logout
  },

  /**
   * Get all users
   */
  {
    method: 'GET',
    path: '/users',
    config: {
      auth: 'jwt',
      description: 'List all registered users',
      tags: ['api', 'User']
    },
    handler: users.getUsers
  },

  /*
  * Create a new user
  */
  {
    method: 'POST',
    path: '/users/new',
    config: {
      auth: false,
      description: 'Register',
      notes: 'Creates a new user. Sends a email to confirm it and Return a valid token',
      tags: ['api', 'Register', 'User'],
      validate: {
        payload: createUserSchema
      },
      // Before the route handler runs, verify that
      // the user is unique and assign the result to 'user'
      pre: [{
        method: verifyUniqueUser,
        assign: 'user'
      }]
    },
    handler: users.addUser
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
      },
      description: 'Update User information',
      notes: 'Only the user whos **ID** it is may update the info',
      tags: ['api' , 'User', 'Update']
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
      auth: 'jwt',
      description: 'User info by Id',
      notes: 'Returns User info by by ID',
      tags: ['api', 'User']
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
      },
      description: 'Delete User',
      notes: 'Providing a valid *Token* and confirm with password and User account is deleted',
      tags: ['api', 'User']
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
      auth: 'jwt',
      description: 'Current User Info',
      notes: 'Providing a valid *Token* would invalidate it.',
      tags: ['api', 'logout', 'token']
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
      auth: 'jwt',
      description: 'Teams current user is In',
      notes: 'Return a array of team user requesting this is currently in',
      tags: ['api', 'User', 'Team']
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
      auth: 'jwt',
      description: 'Join matchmaking',
      notes: 'If User has verified his email address he he then allowed to join matchmaking.',
      tags: ['api', 'User', 'Team', 'Matchmaking']
    },
    handler: users.joinMatchmaking
  },
  {
    /**
     * Get user by request id
     */
    method: 'GET',
    path: '/match/teams',
    config: {
      description: 'List avaible teams to join',
      notes: 'This is a result if matchmaking And will return Teams a user is avaible to join. \n\n If enought people confirm to join a team. Team is then created',
      tags: ['api', 'User', 'Team', 'Matchmaking']
    },
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
  }
];

export default routes;
