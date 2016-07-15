import Boom from 'boom'
import User from '../Models/User'
import { formatUser } from '../api/users/util';
import Joi from 'joi'


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
          callback(null, true, user);
        }
      }
    }
  });
}

export function basicAuth (request, Username, password, callback) {
  if (!validateEmail(Username)) {
    User.findOne({
      username: Username
    }, (err, user) => {
      if (err) {
        callback(err);
        return;
      }
      if (!user) {
        callback(Boom.unauthorized('user not found'));
        return;
      }
      user.authenticate(password, (err, res) => {
        if (err) {
          callback(err);
        }
        callback(null, res, formatUser(user, 'user'));
      });
    });
  } else {
    User.findOne({
      email: Username
    }, (err, user) => {
      if (err) {
        callback(err);
        return;
      }
      if (!user) {
        callback(Boom.unauthorized('user not found'));
        return;
      }
      user.authenticate(password, (err, res) => {
        if (err) {
          callback(err);
        }
        callback(null, res, formatUser(user, 'user'));
      });
    });
  }
}

export function validateEmail(email){
  const schema = { email: Joi.string().email({minDomainAtoms: 2}) };
  return ((Joi.validate({email: email}, schema).error === null) ? true : false);
}

export function validateUser(user, callback){
  User.count({_id: user}, (err, count) => {
    if (count > 0) {
      callback(true);
    }else {
      callback(false);
    }
  });
  
}
