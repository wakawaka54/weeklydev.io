import Boom from 'boom';
import shortid from 'shortid';

import User from '../../Models/User.js';
import Team from '../../Models/Team.js';
import Survey from '../../Models/Survey.js';
import GhostUser from '../../Models/GhostUser.js';

import * as Code from '../../Utils/errorCodes.js';
import { isAdmin } from '../../Utils/validation.js';
import { sendEmail } from '../../Utils/email.js';
import { generateUUID, formatUser, createToken } from './util.js';
import config from 'config';

export function login (req, res) {
  User.findById(req.Credentials.id)
    .populate({ path: 'team', populate: { path: 'manager frontend backend' }})
    .populate('project')
    .populate({
      path: 'ghostTeams',
      populate: {
        path: 'users',
        populate: {
          path: 'id'
        }
      }
    })
    .exec()
    .catch((err) => res(Boom.unauthorized(err)))
    .then((user) => {
      if (!user) return res(Boom.unauthorized('user not found'));
      let token = createToken(user);
      res({ token, user: formatUser(user, 'user') })
        .code(200)
        .state('weeklydevtoken', token, config.get('cookies'));
    });
};

export function logout (req, res) {
  if (!req.auth.credentials.token.valid) {
    res(Boom.unauthorized('user not found'));
  } else {
    let user = req.auth.credentials;
    user.token.valid = false;
    user.save()
      .catch(err => res(Boom.badRequest(err)))
      .then(user => res({ success: true, message: 'successfully logged out' }));
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
  user.save()
    .catch(err => Boom.badImplementation(err))
    .then(user => {
      res({ token: createToken(user), user: formatUser(user, 'user') }).code(201);

      let subject = 'Confirm your weeklydev.io account.';
      let text = `Hey! Thanks for registereing for weeklydev.io! Visit the following link to verify your account: http://localhost:${config.get('http.port')}/v1/users/confirm/${user.userId}`;
      let email = user.email;
      sendEmail(email, subject, text, null);
    });
};

export function getCurrentUser (req, res) {
  User.findById(req.Token.id)
    .populate({ path: 'team', populate: { path: 'manager frontend backend' }})
    .populate('project')
    .populate({
      path: 'ghostTeams',
      populate: {
        path: 'users',
        populate: {
          path: 'id'
        }
      }
    })
    .exec()
    .catch((err) => res(Boom.unauthorized(err)))
    .then((user) => {
      if (!user) return res(Code.userNotFound);
      res(formatUser(user, 'user'));
    });
};

export function getTeamsIn (req, res) {
  let query = ((req.params.id) ? User.findById(req.Token.id) : User.findByUserId(req.params.id));
  query.populate('team').exec()
    .catch(err => res(Code.userNotFound))
    .then(user => {
      if (!user) return res(Code.userNotFound);
      res(user.team);
    });
};

export function getUsers (req, res) {
  User.find().exec()
    .catch(err => res(Boom.badRequest(err)))
    .then(users => {
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
  User.findByUserIdAndRemove(req.params.id).exec()
    .catch(err => res(Boom.badImplementation(err)))
    .then(user => {
      if (!user) return res(Code.userNotFound);
      res(formatUser(user, 'user')).code(200);
    });
};

export function getUser (req, res) {
  User.findByUserId(req.params.id).exec()
    .catch(err => res(Code.userNotFound))
    .then(user => {
      if (!user) return res(Code.userNotFound);
      res(formatUser(user, 'users')).code(200);
    });
};

export function updateUser (req, res) {
  let payload = req.payload;
  let query = ((req.params.id) ? User.findByUserId(req.params.id) : User.findById(req.Token.id));
  query.exec()
    .catch(err => res(Boom.wrap(err)))
    .then(user => {
      if (!user) return res(Boom.wrap(new Error('User not found.')));
      if (payload.email && payload.email !== user.email) {
        user.email = payload.email;
        user.verified = false;
        let subject = 'Confirm your weeklydev.io account.';
        let text = `Your Email was changed for the site www.weeklydev.io. Visit the following link to verify your account: http://localhost:${config.get('http.port')}/v1/users/confirm/${user.userId}`;
        let email = user.email;
        sendEmail(email, subject, text, null);
      }
      if (payload.passOld && payload.passNew) {
        if (!user.authenticate(payload.passOld)) {
          res(Code.invalidPassword);
        }else {
          user.password = payload.passNew;
        }
      }
      user.save()
        .catch(err => res(Boom.wrap(err)))
        .then(user => res(formatUser(user, 'user')));
    });
};

export function adminTest (req, res) {
  // if (isAdmin(req.auth.credentials.scope)) {
  res(req.auth.credentials).code(200);
};

export function confirmUserAccount (req, res) {
  User.findOneAndUpdate({userId: req.params.token}, {verified: true}, (user) => {
    // Eventually we can redirect to the front end but for now its just a simple response.
    res('Your account on weeklydev.io has been confirmed!');
  });
};

export function requestPasswordReset (req, res) {

  // If a token was previously generated, use that instead
  if (!req.auth.credentials.passwordResetToken) {
    let pwToken = shortid.generate();
    User.findByUserIdAndUpdate(req.auth.credentials.userId, {passwordResetToken: pwToken}, (err, user) => {
      sendPasswordResetEmail(pwToken);
      res();
    });
  }else {
    sendPasswordResetEmail(req.auth.credentials.passwordResetToken);
    res();
  }

  function sendPasswordResetEmail (token) {
    let subject = 'Password Reset for Weeklydev.io';
    let text = `Hey! Click the following link to complete resetting your password: http://${config.get('http.host')}:${config.get('http.port')}/v1/users/passwordreset/${token}. If you did not request this password reset, then you can ignore this email. Thanks.`;
    let email = req.auth.credentials.email;
    sendEmail(email, subject, text, null);
  }
};

export function passwordReset (req, res) {
  let pwToken = req.params.token;
  let newPass = req.payload.password;

  User.findOne({passwordResetToken: pwToken})
    .then(user => {
      console.log(user);
      if (user.userId === req.auth.credentials.userId) {
        user.passwordResetToken = '';
        user.password = req.payload.password;
        user.save((err) => {
          if (err)
            return res(err);

          res();
        });
      }else {
        res(Code.invalidPasswordResetToken);
      }
    })
    .catch(err => {
      console.log('Could not find a user with that password reset token.');
      res(Code.userNotFound);
    });
};
