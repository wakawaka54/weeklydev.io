// This can be used for easy identification of a problem
// and not scrathing your head what happend and why are 
// you getting that error that just says the same thing
// over and over again

// error code organization
//  Server        :   0xx
//  Register      :   1xx
//  Login         :   2xx
//  User          :   3xx
//  Survey        :   4xx
//  Team          :   5xx
//  Projects      :   6xx
//  Submissions   :   7xx
var Boom = require('boom');
function applyErrorCode (error) {
  error.output.payload.errorCode = error.data.errorCode;
  return error;
}
module.exports = {
  applyErrorCode: applyErrorCode,
  // Server
  internalServerError: applyErrorCode(Boom.create(500, 'Sorry, something went wrong on our end', {errorCode: 001})),
  // Users
  userNotFound: applyErrorCode(Boom.create(404, 'User not found', {errorCode: 300})),
  userInTooManyTeams: applyErrorCode(Boom.create(400, 'User in too many Teams', { errorCode: 305 })),
  // Teams
  teamNotFound: applyErrorCode(Boom.create(404, 'Team not found', { errorCode: 500})),
  notOwner: applyErrorCode(Boom.create(401, 'You are not owner of this team', { errorCode: 501})),
  userInTeam: applyErrorCode(Boom.create(400, 'User already on team', { errorCode: 502 })),
  maxUsersInRole: applyErrorCode(Boom.create(400, 'Maximum users in role reached', { errorCode: 503 })),
  maxRequestsReached: applyErrorCode(Boom.create(400, 'Maximum requests reached', { errorCode: 505 })),
  alreadyRequested: applyErrorCode(Boom.create(400, 'You already requested to join this team', { errorCode: 506}))
};
