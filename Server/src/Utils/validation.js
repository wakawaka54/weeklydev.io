import Boom from 'boom';
import User from '../Models/User';
import Project from '../Models/Project.js';
import { formatUser } from '../api/users/util';
import Joi from 'joi';

export function jwtAuth (decoded, request, callback) {
  // do your checks to see if the person is valid
  if (decoded.exp >= Date.now()) {
    callback('Token Expired', false);
  }
  request.Token = decoded;
  return User.findById(decoded.id, function (err, user) {
    if (err || !user) {
      callback(null, false);
    }else {
      if (!user.token.valid) {
        callback(null, false);
      } else {
        if (decoded.jti !== user.token.uuid) {
          callback(null, false);
        }else {
          if (user.manager.length > 0) {
            user.manager.forEach((team, array, index) => {
              user.scope.push(`manager-${team}`);
            });
          }
          user.scope.push(`user-${user.userId}`);
          callback(null, true, user);
        }
      }
    }
  });
};

export function basicAuth (request, Identifier, password, callback) {
  let query = ((!validateEmail(Identifier)) ? User.findOne({ username: Identifier }) : User.findOne({ email: Identifier }));

  query
    .catch(err => callback(err))
    .then(user => {
      if (!user) {
        callback(Boom.unauthorized('user not found'));
      }else {
        user.authenticate(password, (err, res) => {
          if (err) callback(err);
          callback(null, res, formatUser(user, 'user'));
        });
      }
    });
};

export function validateEmail (email) {
  const schema = { email: Joi.string().email({minDomainAtoms: 2}) };
  return ((Joi.validate({email: email}, schema).error === null) ? true : false);
};

export function validateUser (users, cb) {
  if (users instanceof Array) {
    let _user = [];
    let _count = users.length;
    let current = 0;
    users.forEach(user => {
      User.count({userId: user.id}).exec()
        .catch(err => cb(err, null))
        .then(count => {
          _user.push(((count > 0) ? {user: user,valid: true} : {user: user,valid: false}));
          current++;
          if (current == _count) {
            cb(null, _user);
          }
        });
    });
  }else {
    User.count({userId: users}).exec()
      .catch(err => callback(null, false))
      .then(count => ((count > 0) ? cb(null, true) : cb(null, false)));
  }
};

export function validateProject(project, cb)
{
  Project.count({_id: project.id}).exec()
    .catch(err => cb(err, null))
    .then(count => {
        cb(null, count > 0);
    });
}

export function isAdmin (scope) {
  return scope.indexOf('admin') >= 0;
};
