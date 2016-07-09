'use strict';

const Boom = require('boom');
const Team = require('../../models/Team');
const User = require('../../../users/models/User');
const Code = require('../../../../config/errorCodes');
const findUserInTeam = require('../../util/teamFunctions').findUserInTeam;
// TOOD: figure out a way to store a config admin can edit on the website
// NOTE: ex. (Max manager in a team: 2, Max backend developers in a team: 4, max time team can be inacive before deletion: 2W )

module.exports = (req, res) => {
  Team.findById(req.params.id, (err, team) => {
    if (err || !team) {
      // Team not found
      res(Code.teamNotFound);
    }else {
      User.findById(req.payload.user, (err, user) => {
        if (err || !user) {
          // User not found
          res(Code.userNotFound);
        }else {
          // Checks if user is in more then 3 teams
          if (user.team.length >= 3) {
            res(Code.userInTooManyTeams);
          }else {
            // If the user who requested is team owner
            if (req.Token.id == team.owner) {
              // Makes sure the new user is NOT in the team already
              if (findUserInTeam(req.payload.user, [team.manager, team.backend, team.frontend])) {
                // res(Code.userAlready); TODO: Fix this for now use this
                // NOTE: I don't know why the above doesn't work and this does...
                res(Code.applyErrorCode(Boom.create(400, 'User already on team', { errorCode: 501 })));
              }else {
                // Only 3 role avaible
                switch (req.payload.role) {
                  case 'manager':
                    if (team.manager.length >= 1) {
                      res(Code.maxUsersInRole);
                    } else {
                      team.manager.push(req.payload.user);
                    }
                    break;
                  case 'backend':
                    if (team.backend.length >= 2) {
                      res(Code.maxUsersInRole);
                    }else {
                      team.backend.push(req.payload.user);
                    }
                    break;
                  case 'frontend':
                    if (team.frontend.length >= 2) {
                      res(Code.maxUsersInRole);
                    }else {
                      team.frontend.push(req.payload.user);
                    }
                    break;
                  default:
                    // This shouldn't happend
                    console.log(req.payload);
                    return;
                }
                // Adds the user to meta data
                team.meta.members.push({id: req.payload.user});
                team.save((err, team) => {
                  if (err) {
                    console.log(err);
                    res(Boom.badImplementation(err));
                  }else {
                    user.team.push(team.id);
                    user.save(err => {
                      if (err) {
                        console.log(err);
                        res(Boom.badImplementation(err));
                      }else {
                        res(team);
                      }
                    });
                  }
                });
              }
            }else {
              res(Code.notOwner);
            }
          }
        }
      });
    }
  });
};
