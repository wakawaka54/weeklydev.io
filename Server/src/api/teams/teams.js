import Boom from 'boom';
import shortid from 'shortid';
import Team from '../../Models/Team';
import User from '../../Models/User';
import * as Code from '../../Utils/errorCodes.js';
import { findUserInTeam } from './util.js';

let saveTeam = (team, res) => {
  team.save()
    .catch(err => res(Boom.badImplementation(err)))
    .then(team => res(team));
};

/*
 * Add Team 
 */
export function addTeam (req, res) {
  let team = new Team();
  team[owner] = req.Token.id;
  team[teamId] = shortid.generate();
  team[isActive] = true;
  if (req.payload.users && req.pre.users) {
    req.pre.users.forEach(user => {
      if (user.valid) {
        team[members].push(user.user);
        team.meta['members'].push({id: user.user.id});
      }else {
        res(Boom.badRequest({msg: 'Incorect User Details',error: user.user}));
      }
    });
    saveTeam(team, res);
  }else {
    saveTeam(team, res);
  }
};

/*
 * Get Team
 */
export function getTeams (req, res) {
  Team.find()
    .populate('manager frontend backend', 'id username isSearching project team')
    .exec()
    .catch(err => res(Boom.badImplementation(err)))
    .then(team => res(team));
};

/*
 * Add user to team
 */
export function addUserToTeam (req, res) {
  Team.findByTeamId(req.params.id).exec()
    .catch(err => res(Code.teamNotFound))
    .then(team => {
      User.findByUserId(req.payload.id).exec()
        .catch(err => res(Code.teamNotFound))
        .then(user => {
          // Checks if user is in more then 3 teams
          if (user.team.length >= 3) {
            res(Code.userInTooManyTeams);
          }else {
            // If the user who requested is team owner
            if (req.Token.id !== team.owner) {
              res(Code.notOwner);
            }else {
              // Makes sure the new user is NOT in the team already
              if (findUserInTeam(user.id, [team.manager, team.backend, team.frontend])) {
                res(Code.userInTeam);
              }else {
                if (team[req.payload.role].length >= 2 || team.members.length >= 5) {
                  res(Code.maxUsersInRole);
                }else {
                  team.members.push(req.payload);
                  // Adds the user to meta data
                  team.meta.members.push({id: req.payload.user});

                  team.save()
                    .catch(err => res(Boom.badImplementation(err)))
                    .then(team => res({success: true, code: 200}).code(200));
                }
              }
            }
          }
        });
    });
};

/*
 * Delete team
 */
export function deleteTeam (req, res) {
  Team.findByTeamIdAndRemove(req.params.id).exec()
    .catch(err => res(Code.teamNotFound))
    .then(team => res({success: true, code: 200, team: team}).code(200));
};

/*
 * Get team by id
 */
export function getTeam (req, res) {
  Team.findByTeamId(req.params.id)
    .populate('manager.user frontend.user backend.user', 'id username isSearching project team').exec()
    .catch(err => res(Boom.badImplementation(err)))
    .then(team => res(team));
};

/*
 * Request to join a team
 */
export function requestJoinToTeam (req, res) {
  Team.findByTeamId(req.params.id).exec()
    .catch(err => res(Boom.badImplementation(err)))
    .then(team => {
      if (team.requests.length >= 5) {
        res(Code.maxRequestsReached);
      }else {
        if (team.requests.includes(req.Token.id)) {
          res(Code.alreadyRequested);
        }else {
          team.requests.push({id: req.payload.user, role: req.payload.role, msg: req.payload.msg});
          team.save()
            .catch(err => res(Boom.badImplementation(err)))
            .then(team => res({success: true, code: 200}).code(200));
        }
      }
    });
};

/*
 * Update a team
 */
export function updateTeam (req, res) {
  Team.findByTeamId(req.params.id).exec()
    .catch(err => res(Boom.badImplementation(err)))
    .then(team => {
      if (req.Token.id !== team.owner) {
        res(Code.notOwner);
      }else {
        if (req.payload.owner) team[owner] = req.payload.owner;
        if (req.payload.project) team[project] = req.payload.project;
        if (req.payload.submission) team[submission] = req.payload.submission;
        if (req.payload.isActive) team[isActive] = req.payload.isActive;
        team.save()
          .catch(err => res(Boom.badImplementation(err)))
          .then(team => res({success: true, code: 200, team: team}).code(200));
      }
    });
};
