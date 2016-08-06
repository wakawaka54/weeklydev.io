import * as match from './match.js';

const routes = [
  /**
   *  Joins a Matchmaking
   */
  {
    method: 'POST',
    path: '/matching/join',
    config: {
      auth: 'jwt',
      description: 'Join matchmaking',
      notes: 'If User has verified his email address he he then allowed to join matchmaking.',
      tags: ['api', 'User', 'Team', 'Matchmaking']
    },
    handler: match.joinMatchmaking
  }, {
    method: 'POST',
    path: '/matching/test',
    config: {
      auth: false,
      description: 'Test Run for Matchmaking',
      notes: '...',
      tags: ['api', 'User', 'Team', 'Matchmaking']
    },
    handler: match.startMatch
  },
  /**
   * Matchmaking results
   */
  {
    method: 'GET',
    path: '/matching/teams',
    config: {
      description: 'List avaible teams to join',
      notes: `This is a result if matchmaking And will return Teams a user is avaible to join.

If enought people confirm to join a team. Team is then created`,
      tags: ['api', 'User', 'Team', 'Matchmaking']
    },
    handler: match.getGhostTeams
  }
];
export default routes;
