import Boom from 'boom';
import shortid from 'shortid';
import Team from '../../Models/Team';
import User from '../../Models/User';
import * as Code from '../../Utils/errorCodes.js';
import { validateUser } from '../../Utils/validation.js';
import { findUserInTeam } from './util.js';

/*
 * Add Team 
 */

export function addTeam (req, res) {
  var team = new Team({
    owner: req.Token.id,
    teamId: shortid.generate()
  });
  if (req.payload.role) {
    var usersProcessed = 0;
    var stop = false;
    req.payload.role.forEach((user, index, array) => {
      validateUser(user.id, valid => {
        if (!stop) {
          if (valid) {
            team[user.role].push(user.id);
            team.meta['members'].push({id: user.id});
            usersProcessed++;
            if (usersProcessed === array.length) {
              saveTeam(team, res);
            }
          }else {
            stop = true;
            res(Code.userNotFound);
          }
        }
      });
    });
  }else {
    saveTeam(team, res);
  }
};

function updateUsers (team, callback) {
  team.meta.members.forEach((user, array, index) => {
    User.findByIdAndUpdate(user.id, { $push: { team: team.id }}, (err, user) => {
      if (err || !user) {
        callback(err, false);
      }
    });
  });
  callback(null, true);
}

function saveTeam (team, res) {
  team.save((err, team) => {
    if (err) {
      console.log(err);
      res(Boom.badImplementation(err));
    }else {
      updateUsers(team, (err, done) => {
        if (err || !done) {
          res(Code.internalServerError);
          return;
        }else {
          res(team);
        }
      });
    }
  });
}

/*
 * Get Team
 */
export function getTeams (req, res) {
  Team.find().populate('manager frontend backend', 'id username is_searching project team').exec((err, team) => {
    res(team);
  });
};

/*
 * Add user to team
 */
export function addUserToTeam (req, res) {
  // TODO: Rewrite this with promises!!!!
  Team.findByTeamId(req.params.id, (err, team) => {
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

/*
 * Delete team
 */
export function deleteTeam (req, res) {
  Team.findByIdAndRemove(req.params.id, (err, team) => {
    if (err || !team) {
      // Team not found
      res(Code.teamNotFound);
    }else {
      res({msg: 'success', team: team});
    }
  });
};

/*
 * Get team by id
 */
export function getTeam (req, res) {
  Team.findByTeamId(req.params.id).populate('manager.user frontend.user backend.user', 'id username is_searching project team').exec((err, team) => {
    res(team);
  });
};

/*
 * Request to join a team
 */
export function requestJoinToTeam (req, res) {
  Team.findByTeamId(req.params.id, (err, team) => {
    if (team.requests.length >= 10) {
      res(Code.maxRequestsReached);
    }else {
      if (team.requests.indexof(req.payload.user) >= 0) {
        res(Code.alreadyRequested);
      }else {
        team.requests.push({user: req.payload.user, role: req.payload.role, msg: req.payload.msg});
        res({msg: 'Success'}).code(200);
      }
    }
  });
};

/*
 * Update a team
 */
export function updateTeam (req, res) {
  Team.findByTeamId(req.params.id, (err, team) => {
    if (req.Token.id !== team.owner) {
      res(Boom.unauthorized('only team owner can update team details'));
    }else {
      if (req.payload.owner) {
        team.owner = req.payload.owner;
      }
      if (req.payload.manager && req.payload.manager_role) {}
      team.manager.push({user: req.payload.manager, role: req.payload.manager_role});
      team.frontend.push({user: req.payload.frontend, role: req.payload.frontend_role});
      team.backend.push({user: req.payload.backend, role: req.payload.backend_role});
    }
  });
};
