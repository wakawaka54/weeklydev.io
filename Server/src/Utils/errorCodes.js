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

import Boom from 'boom';

export function applyErrorCode (error) {
  error.output.payload.errorCode = error.data.errorCode;
  return error;
};

// Server
export const internalServerError = applyErrorCode(Boom.create(500, 'Sorry, something went wrong on our end', {errorCode: '001'}));

// Users
export const userNotFound = applyErrorCode(Boom.create(404, 'User not found', {errorCode: 300}));
export const invalidPassword = applyErrorCode(Boom.create(400, 'Invalid password.', { errorCode: 304 })); // Don't use this in anywhere else then user settings !! Please
export const userInTooManyTeams = applyErrorCode(Boom.create(400, 'User in too many Teams', { errorCode: 305 }));
export const invalidPasswordResetToken = applyErrorCode(Boom.create(401, 'Invalid password reset token.', { errorCode: 306 }));

// Surveys
export const surveyNotFound = applyErrorCode(Boom.create(404, 'Survey not found', {errorCode: 400}));

// Teams
export const teamNotFound = applyErrorCode(Boom.create(404, 'Team not found', { errorCode: 500}));
export const notOwner = applyErrorCode(Boom.create(401, 'You are not owner of this team', { errorCode: 501}));
export const userInTeam = applyErrorCode(Boom.create(400, 'User already on team', { errorCode: 502 }));
export const maxUsersInRole = applyErrorCode(Boom.create(400, 'Maximum users in role reached', { errorCode: 503 }));
export const maxRequestsReached = applyErrorCode(Boom.create(400, 'Maximum requests reached', { errorCode: 505 }));
export const alreadyRequested = applyErrorCode(Boom.create(400, 'You already requested to join this team', { errorCode: 506}));
