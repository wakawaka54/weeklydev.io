import Boom from 'boom'

import User from '../../Models/User.js'
import Team from '../../Models/Team.js'
import Survey from '../../Models/Survey.js'
import GhostUser from '../../Models/GhostUser.js'
import * as Code from '../../Utils/errorCodes.js'

import { generateUUID, formatUser, createToken } from './util.js'


export function login(req, res){
  User.findById(req.Credentials.id, (err, user) => {
    if (err || !user) {
      res(Boom.unauthorized('user not found'));
    }
    user.token.valid = true;
    user.token.uuid = generateUUID();
    user.token.full = createToken(user);
    user.save((err, done) => {
      if (err) {
        throw Boom.badRequest(err);
      }
      res(formatUser(user, 'user')).code(200);
    });
  })

}

export function logout(req, res){
  User.findOne({'token.full': req.auth.token}, (err, user) => {
    if (err || !user) {
      res(Boom.unauthorized('user not found'));
    }else {
      if (!user.token.valid) {
        res(Boom.unauthorized('user already logged out'));
      }else {
        user.token.valid = false;
        user.save((err, done) => {
          if (err) {
            throw Boom.badRequest(err);
          }
          res({
            succes: true,
            message: 'successfully logged out'
          });
        });
      }
    }
  });
}

export function addUser(req, res){
  let user = new User();
  user.email = req.payload.email;
  user.username = req.payload.username;
  user.admin = false;
  user.password = req.payload.password;
  user.token.uuid = generateUUID();
  user.token.full = createToken(user);
  user.token.valid = true;
  // user.token_expire.expire = (Date.now() + (24 * 60 * 60))
  user.save((err, user) => {
    if (err) {
      throw Boom.badRequest(err);
    }
    // If the user is saved successfully, Send a JWT
    res(formatUser(user, 'user')).code(201);
  });
}

export function getCurrentUser(req, res){
  User.findById(req.Token.id, (err, user) => {
    if (err || !user) {
      res(Boom.unauthorized('user not found'));
    } else {
      res(formatUser(user, 'user'));
    }
  });
}

export function getTeamsIn(req, res){
  User.findById(req.Token.id).populate('team').exec((err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    }else {
      res(user.team);
    }
  });
}

export function getUsers(req, res){
  User.find(function (err, users) {
    if (err) {
      res(Boom.badRequest(err));
    }
    if (req.Token.scope == 'admin') {
      res(users).code(200);
    } else {
      var Users = [];
      users.forEach((user) => {
        Users.push(formatUser(user, 'users'));
      });
      res(Users);
    }
  });
}

export function deleteUser(req, res){
  if (req.Token.id === req.params.id || req.Token.scope === 'admin') {
    User.findByIdAndRemove(req.params.id, (err, user) => {
      if (err) {
        console.error(err);
        res(Boom.wrap(err, 400));
      }
      if (user) {
        res(formatUser(user, 'user')).code(200);
      } else {
        res(Boom.notFound('User not found'));
      }
    });
  } else {
    res(Boom.unauthorized('you cannot delete account that is not yours'));
  }
}

export function getUser(req, res){
  User.findById(req.params.id, function (err, user) {
    if (err || !user) {
      res(Code.userNotFound);
      return;
    }
    res(formatUser(user, 'users')).code(200);
  });
}

export function updateUser(req, res){
  User.findByIdAndUpdate(req.params.id, {
    $set: {
      username: req.payload.username,
      email: req.payload.email,
      admin: req.payload.admin,
      password: req.payload.password
    }
  }, function (err, user) {
    if (err) return console.error(err);
    res(formatUser(user), 'user');
  });
}

/*
 * Get a ghost team for matchmaking
 */
export function getGhostTeams(req, res){
  User.findById(req.Token.id).populate('ghostTeams', 'confirmed manager frontend backend score').exec((err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    }else {
      res(user.ghostTeams);
    }
  });
}

/*
 * Join a team automatically
 */

export function joinMatchmaking(req, res){
  // TODO: add check for email confirmation
  Survey.findByUserId(req.Token.id, (err, survey) => {
    if (err || !survey) {
      res(Code.surveyNotFound);
    } else {
      addToGhost(survey[0], req.Token.id, err => {
        if (err) {
          res(Boom.wrap(err));
        }
        res('ok').code(200);
      });
    }
  });
}

function addToGhost (survey, userId, callback) {
  let ghost = new GhostUser();
  ghost.userId = userId;
  ghost.preferred_role = survey.preferred_role;
  ghost.project_manager = survey.project_manager;
  ghost.skill_level = survey.skill_level;
  ghost.project_size = survey.project_size;
  ghost.timezone = survey.timezone;
  ghost.save(err => {
    if (err) {
      callback(err);
    }else {
      callback(null);
    }
  });
}
