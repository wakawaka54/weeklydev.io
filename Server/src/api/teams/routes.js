import * as teams from './teams.js';
import teamSchema from '../../Schemas/Team.js';

const routes = [
  {
    // Lists all Teams (disabled or not)
    method: 'GET',
    path: '/teams',
    config: {
      auth: 'jwt',
      description: 'List all teams',
      tags: ['api', 'Team']
    },
    handler: teams.getTeams
  },
  {
    // Create a new team
    method: 'POST',
    path: '/teams',
    config: {
      description: 'Create a new Team',
      notes: 'Create a new **Team** with the team owner being then one who requested this',
      tags: ['api', 'Team'],
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
      auth: 'jwt',
      description: 'Get Team details by teamId',
      tags: ['api', 'Team']
    },
    handler: teams.getTeam
  },
  {
    // Bulk update
    method: 'PUT',
    path: '/teams/{id}',
    config: {
      auth: {
        scope: ['manager-{params.id}', 'admin']
      },
      description: 'Update Team Information',
      notes: 'Update the team infomation. \n\n**IMPORTANT**: only the Team owner can update it.',
      tags: ['api', 'Team'],
      validate: {
        payload: teamSchema
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
      },
      description: 'Delete Team',
      notes: 'Deletes team along with submissions.\n\n**IMPORTANT**: only the Team owner can update it.',
      tags: ['api', 'Team']
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
      },
      description: 'Add a new member to the team',
      notes: 'Add a new member to the team as long as the team is not full, or user is not already in some team.\n\n**IMPORTANT**: only the Team owner can update it.',
      tags: ['api', 'Team']
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
      auth: 'jwt',
      description: 'Request to join a team',
      notes: 'Puts a request to join a team. If team owner approves of this request Automatically joins the team \n\n**USER CAN ONLY REQUEST TO JOIN 2 TEAMS AT A TIME** and uppon accepting into one of those the other request is deleted',
      tags: ['api', 'Team']
    },
    handler: teams.requestJoinToTeam
  }
];

export default routes;
