import * as teams from './teams.js';
import teamSchema from '../../Schemas/Team.js';

const routes = [
  {
    // Lists all Teams (disabled or not)
    method: 'GET',
    path: '/teams',
    config: {
      auth: 'jwt'
    },
    handler: teams.getTeams
  },
  {
    // Create a new team
    method: 'POST',
    path: '/teams',
    config: {
      validate: {
        payload: teamSchema
      },
      // pre: [{
      //   method: 
      // TODO: add method that checks if team name and projects are taken
      // NOTE: also check if team name is taken, the owner of the team can create only 3 team max.
      // }],
      auth: 'jwt'
    },
    handler: teams.addTeam
  },
  {
    // Lists all Teams (disabled or not)
    method: 'GET',
    path: '/teams/{id}',
    config: {
      auth: 'jwt'
    },
    handler: teams.getTeam
  },
  {
    // Bulk update
    method: 'PUT',
    path: '/teams/{id}',
    config: {
      validate: {
        payload: teamSchema
      },
      auth: {
        scope: ['manager-{params.id}', 'admin']
      }
    },
    handler: teams.updateTeam
  },
  {
    // Delete a team by ID if you are the owner or admin 
    // TODO: autodelete the team after some period of inactivity
    method: 'DELETE',
    path: '/teams/{id}',
    config: {
      auth: {
        scope: ['manager-{params.id}', 'admin']
      }
    },
    handler: teams.deleteTeam
  },
  {
    // Add a user to team (only owner)
    method: 'POST',
    path: '/teams/{id}/add',
    config: {
      // validate: {
      //   payload: teamSchema // TOOD: add a new validation otherwise this will not work
      // },
      auth: {
        scope: ['manager-{params.id}', 'admin']
      }
    },
    handler: teams.addUserToTeam
  },
  {
    // Request a join to a team (every User)
    method: 'POST',
    path: '/teams/{id}/join',
    config: {
      // validate: {
      //   payload: teamSchema // TOOD: add a new validation otherwise this will not work
      // },
      auth: 'jwt'
    },
    handler: teams.requestJoinToTeam
  }
];

export default routes;
