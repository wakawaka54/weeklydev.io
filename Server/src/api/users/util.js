import Boom from 'boom';
import User from '../../Models/User.js';
import jwt from 'jsonwebtoken';
import uuid from 'node-uuid';
import Joi from 'joi';
import config from 'config';

export function verifyUniqueUser (req, res) {
  // Find an entry from the database that
  // matches either the email or username
  User.findOne({
    $or: [{
      email: req.payload.email
    }, {
      username: req.payload.username
    }]
  }, (err, user) => {
    // Check whether the username or email
    // is already taken and error out if so
    if (user) {
      if (user.username === req.payload.username) {
        res(Boom.badRequest('Username taken'));
        return;
      }
      if (user.email === req.payload.email) {
        res(Boom.badRequest('Email taken'));
        return;
      }
    }
    // If no username or email is found send it on
    // to the route handler
    res(req.payload);
  });
};

export function authenticateUser (req, res) {
  // TODO: [1] remove all of this shit and rewrite it all
  User.findById(req.Credentials.id, (err, user) => {
    if (err) {
      console.error(err);
      res(Boom.wrap(err, 400));
    }
    if (!user) {
      res(Boom.badRequest('User not found!'));
      return;
    }
    user.token.uuid = generateUUID();
    user.save((err, user) => {
      if (err) {
        console.log('-- Something went wrong:');
        console.log(err);
        res(Boom.wrap(Boom.create(500, 'Internal Server Error', {
          timestamp: Date.now()
        })));
      }
      res(req.payload);
    });
  });
};

export function generateUUID () {
  return uuid.v4(uuid.nodeRNG);
};

export function formatUser (user, opts) {
  return user.toObject({ scope: opts, transform: true });
};

export function createToken (user, expires = '365 days') {
  let scopes = 'user';

  // Sign the JWT
  return jwt.sign({
    id: user._id
  }, config.get('jwt'), {
    algorithm: 'HS256',
    jwtid: user.token.uuid,
    expiresIn: expires // exp: in 24H
  });
};
