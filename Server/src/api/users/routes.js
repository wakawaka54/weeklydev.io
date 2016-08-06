import { authenticateUser, verifyUniqueUser } from './util.js';
import userSchema from '../../Schemas/User.js';
import updateUserSchema from '../../Schemas/UpdateUser.js';
import shortIdSchema from '../../Schemas/shortId.js';
import * as users from './users.js';
import Joi from 'joi';

const routes = [
  /**
   * login
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
   * logout
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
        payload: userSchema
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
      validate: {
        payload: updateUserSchema,
        params: shortIdSchema
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
      validate: {
        params: shortIdSchema
      },
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
      validate: {
        params: shortIdSchema
      },
      description: 'Delete User',
      notes: 'Providing a valid *Token* and confirm with password and User account is deleted',
      tags: ['api', 'User']
    },
    handler: users.deleteUser
  },
  /**
   * Return the teams user is currently in
   */
  {
    method: 'GET',
    path: '/users/{id}/teams',
    config: {
      validate: {
        params: shortIdSchema
      },
      description: 'Return Users current teams',
      notes: 'Return the team user is currently in',
      tags: ['api', 'User']
    },
    handler: users.getTeamsIn
  },

  /**
   * Get current user info
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
   * Get current users teams
   */
  {
    method: 'GET',
    path: '/users/me/teams',
    config: {
      auth: 'jwt',
      description: 'Teams current user is In',
      notes: 'Return a array of teams current user is in',
      tags: ['api', 'User', 'Team']
    },
    handler: users.getTeamsIn
  },
  /**
   * Update Current users information
   */
  {
    method: 'PUT',
    path: '/users/me',
    config: {
      auth: 'jwt',
      validate: {
        payload: updateUserSchema
      },
      description: 'Update current users information',
      notes: 'Posting a full users object',
      tags: ['api', 'User', 'Team']
    },
    handler: users.updateUser
  },
  /**
   * Update Current users Password
   */
  {
    method: 'POST',
    path: '/users/me/password',
    config: {
      auth: 'jwt',
      validate: {
        payload: {
          passOld: Joi.string().alphanum().min(6).max(32).description('Your Old Password').required(),
          passNew: Joi.string().alphanum().min(6).max(32).description('Your New Password').required()
        }
      },
      description: 'Update current users password',
      notes: 'Update the users password after providing the old password and a new password.',
      tags: ['api', 'User', 'Team']
    },
    handler: users.updateUser
  },
  /**
   *  Confirms users account
   */
  {
    method: 'GET',
    path: '/users/confirm/{token}',
    config: {
      auth: false,
      validate: {
        params: {
          token: Joi.string().token().length(8)
        }
      },
      description: 'Confirm users account',
      notes: `Confirms users account, confirmed account are able to join a matchmaking.`,
      tags: ['api', 'User', 'Team', 'Matchmaking']
    },
    handler: users.confirmUserAccount
  },
  /**
   *  Request to reset password
   */
  {
    method: 'GET',
    path: '/users/passwordreset',
    config: {
      auth: {
        scope: ['user']
      },
      description: 'Request a password reset.',
      notes: 'Request a link for password reset to be sent to the users email.',
      tags: ['api', 'User']
    },
    handler: users.requestPasswordReset
  },
  /**
   *  Resets password
   */
  {
    method: 'POST',
    path: '/users/passwordreset/{token}',
    config: {
      auth: false,
      validate: {
        params: {
          token: Joi.string().token().length(8)
        },
        payload: {
          password: Joi.string().alphanum().min(6).max(32).description('Your New Password')
        }
      },
      description: 'Reset a user password',
      notes: 'Verify the password reset token and reset the password for the user.',
      tags: ['api', 'User']
    },
    handler: users.passwordReset
  }
];

export default routes;
