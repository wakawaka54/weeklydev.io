import Boom from 'Boom'
import User from '../../Models/User.js'
import jwt from 'jsonwebtoken'
import uuid from 'node-uuid'
import Joi from 'joi'

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
}

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
}

function generateUUID(){
  return uuid.v4(uuid.nodeRNG);
}

export function formatUser(user, opts) {
  switch (opts) {
    case 'admin':
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        admin: user.admin,
        team: user.team,
        project: user.project
      };
    case 'user':
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        admin: user.admin,
        team: user.team,
        project: user.project,
        token: user.token.full
      };
    case 'users':
      return {
        id: user.id,
        username: user.username,
        admin: user.admin,
        team: user.team,
        project: user.project
      };
    default:
      return {
        id: user.id,
        username: user.username,
        team: user.team,
        project: user.project
      };
  }
}

export function createToken (user, expires) {
  let scopes = 'user';
  // Check if the user object passed in
  // has admin set to true, and if so, set
  // scopes to admin
  if (user.admin) {
    scopes = 'admin';
  }

  expires = expires || '365 days';

  // Sign the JWT
  return jwt.sign({
    id: user._id,
    uuid: user.token.uuid,
    scope: scopes
  }, secret, {
    algorithm: 'HS256',
    expiresIn: expires // exp: in 24H
  });
}
