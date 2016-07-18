import Boom from 'boom';
import shortid from 'shortid';
import User from '../../Models/User.js';
import Team from '../../Models/Team.js';
import Survey from '../../Models/Survey.js';
import GhostUser from '../../Models/GhostUser.js';
import * as Code from '../../Utils/errorCodes.js';
import { isAdmin } from '../../Utils/validation.js';

import { generateUUID, formatUser, createToken } from './util.js';

export function login (req, res) {
  User.findById(req.Credentials.id)
    .catch((err) => res(Boom.unauthorized(err)))
    .then((_user) => {
      if (!_user) return res(Boom.unauthorized('user not found'));
      _user.token = {
        uuid: generateUUID(),
        valid: true
      };
      return _user.save();
    }).then((user) => {
    let token = createToken(user);
    res({ token, user: formatUser(user, 'user') }).code(200);
  });
};

export function logout (req, res) {
  if (!req.auth.credentials.token.valid) {
    res(Boom.unauthorized('user not found'));
  } else {
    let _user = req.auth.credentials;
    _user.token.valid = false;
    _user.save()
      .catch((err) => res(Boom.badRequest(err)))
      .then((user) => {
        res({
          success: true,
          message: 'successfully logged out'
        });
      });
  }
};

export function addUser (req, res) {
  let payload = req.payload;
  let user = new User({
    userId: shortid.generate(),
    email: payload.email,
    username: payload.username,
    scope: ['user'],
    password: payload.password,
    token: {
      uuid: generateUUID(),
      valid: true
    }
  });
  user.save((err, user) => {
    if (err) {
      throw Boom.badRequest(err);
    }
    // If the user is saved successfully, Send a JWT
    let token = createToken(user);
    res({ token, user: formatUser(user, 'user') }).code(201);
  });
};

export function getCurrentUser (req, res) {
  User.findById(req.Token.id, (err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    } else {
      res(formatUser(user, 'user'));
    }
  });
};

export function getTeamsIn (req, res) {
  User.findById(req.Token.id).populate('team').exec((err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    }else {
      res(user.team);
    }
  });
};

export function getUsers (req, res) {
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
};

export function deleteUser (req, res) {
  User.findByUserIdAndRemove(req.params.id, (err, user) => {
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
};

export function getUser (req, res) {
  User.findByUserId(req.params.id, function (err, user) {
    if (err || !user) {
      res(Code.userNotFound);
      return;
    }
    res(formatUser(user, 'users')).code(200);
  });
};

export function updateUser (req, res) {
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
};

/*
 * Get a ghost team for matchmaking
 */
export function getGhostTeams (req, res) {
  User.findById(req.Token.id).populate('ghostTeams', 'confirmed manager frontend backend score').exec((err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    }else {
      res(user.ghostTeams);
    }
  });
};

/*
 * Join a team automatically
 */

export function joinMatchmaking (req, res) {
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
};

export function adminTest (req, res) {
  // if (isAdmin(req.auth.credentials.scope)) {
  res(req.auth.credentials).code(200);
};

function addToGhost (survey, userId, callback) {
  let ghost = new GhostUser({
    userId: userId,
    preferred_role: survey.preferred_role,
    project_manager: survey.project_manager,
    skill_level: survey.skill_level,
    project_size: survey.project_size,
    timezone: survey.timezone
  });
  ghost.save(err => ((err) ? callback(err) : callback(null)));
}
