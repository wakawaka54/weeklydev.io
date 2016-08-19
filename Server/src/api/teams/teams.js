import Boom from 'boom';
import shortid from 'shortid';
import Team from '../../Models/Team';
import User from '../../Models/User';
import Project from '../../Models/Project';
import * as Code from '../../Utils/errorCodes.js';
import { findUserInTeam, addToUserScope, findUserInRequests, addTeamToProject, removeTeamFromProject, removeFromUserScope } from './util.js';

const resultsPerPage = 20;

/*
 * Add Team
 */
export function addTeam (req, res) {
  let team = new Team({
    manager: req.auth.credentials.id,
    name: req.payload.name,
    isActive: req.payload.isActive
  });

  team.save()
    .then(_team => {
      //Add to user scope that he is Team Manager to allow authorization to Manager Api Endpoints
      addToUserScope(_team.manager, `manager-${_team.id}`)
      return res(_team);
    })
    .catch(err => { return res(Boom.conflict(err)); });
};

/*
 * Get Teams
 */
export function getTeams (req, res) {
  let page = 0;
  if(req.query.page) { page = req.query.page; }

  Team.find()
    .populate({ select: User.safeUser, path: 'manager' })
    .populate({ select: User.safeUser, path: 'members.user'})
    .limit(resultsPerPage)
    .skip(resultsPerPage * page)
    .exec()
    .catch(err => res(Boom.badImplementation(err)))
    .then(team => res(team));
};

export function addProjectTeam (req, res) {
  Team.findByTeamId(req.params.id).exec()
    .then(team => {
      team.project = req.params.pid;
      team.save()
        .then(_team => {
          addTeamToProject(req.params.id, req.params.pid);
          return res(_team);
        })
        .catch(err => res(Boom.badImplementation(err)));
    })
    .catch(err => res(Boom.notFound(err)));
}

export function deleteProjectTeam(req, res) {
  Team.findByTeamId(req.params.id).exec()
    .then(team => {
      team.project = null;
      team.save()
        .then(_team => {
          let objectUpdate = { team: null };
          Project.findProjectAndUpdate(req.params.pid, objectUpdate, (err, project) => {
            return res(_team);
          });
        })
        .catch(err => res(Boom.badImplementation(err)));
    })
    .catch(err => res(Boom.notFound(err)));
}

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
            res(Code.userInTooManyTeams); return;
          }

          // If the user who requested is team owner
          if (req.auth.credentials.id != team.manager) {
            res(Code.notOwner); return;
          }
          // Makes sure the new user is NOT in the team already
          if (findUserInTeam(user.id, team.members)) {
            res(Code.userInTeam); return;
          }

          if(!findUserInRequests(user.id, team.requests)) {
            res(Code.userNotRequested); return;
          }

          let pushObject = {
            user: req.payload.id,
            role: req.payload.role
          };

          team.members.push(pushObject);
          // Adds the user to meta data
          team.meta.members.push({id: req.payload.id});

          //Remove user from requests
          let indexOf = team.requests.indexOf(req.payload.id);
          team.requests.splice(indexOf, 1);

          team.save()
            .catch(err => res(Boom.badImplementation(err)))
            .then(team => res(team).code(200));
        });
    });
};

/*
 * Delete team
 */
export function deleteTeam (req, res) {
  Team.findByTeamIdAndRemove(req.params.id).exec()
    .catch(err => res(Code.teamNotFound))
    .then(team => {
      removeFromUserScope(team.manager, `manager-${team.id}`);
      res({success: true, code: 200, team: team}).code(200)
    });
};

/*
 * Get team by id
 */
export function getTeam (req, res) {
  Team.findByTeamId(req.params.id)
    .populate({ select: User.safeUser, path: 'manager' })
    .populate({ select: User.safeUser, path: 'members.user'})
    .exec()
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
        res(Code.maxRequestsReached); return;
      }

      if (findUserInRequests(req.auth.credentials.id, team.requests)) {
          res(Code.alreadyRequested); return;
      }

      team.requests.push({user: req.auth.credentials.id, role: req.payload.role, msg: req.payload.message});
      team.save()
        .catch(err => res(Boom.badImplementation(err)))
        .then(team => res().code(200));
    });
};

/*
 * Update a team
 */
export function updateTeam (req, res) {
  if(!req.pre.user) { return res(Boom.badImplementation("Invalid User")); }
  Team.findByTeamId(req.params.id).exec()
    .then(team => {

      if (req.auth.credentials.id != team.manager) {
        res(Code.notOwner); return;
      }

      var previousManager = team.manager;
      if (req.payload.manager) team.manager = req.payload.manager;
      if (req.payload.isActive != undefined) team.isActive = req.payload.isActive;

      team.save()
        .then(team => {
          addToUserScope(team.manager, `manager-$(team.id)`);
          removeFromUserScope(previousManager, `manager-$(team.id)`);
          return res(team).code(200);
        })
        .catch(err => res(Boom.badImplementation(err)));
    })
    .catch(err => { console.log("replying"); res(Boom.badImplementation(err)); });
};
