import Boom from 'boom';
import shortid from 'shortid';

import User from '../../Models/User.js';
import Team from '../../Models/Team.js';
import Survey from '../../Models/Survey.js';
import GhostUser from '../../Models/GhostUser.js';

import * as Code from '../../Utils/errorCodes.js';
import { isAdmin } from '../../Utils/validation.js';
import { sendEmail } from '../../Utils/email.js'
import { generateUUID, formatUser, createToken } from './util.js';
import { cookie_options, PORT, HOST } from '../../config/config.js';

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
    res({ token, user: formatUser(user, 'user') })
      .code(200)
      .state('weeklydevtoken', token, cookie_options);
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

    sendConfirmEmail()
    function sendConfirmEmail(){
      let subject = 'Confirm your weeklydev.io account.'
      let text = `Hey! Thanks for registereing for weeklydev.io! Visit the following link to verify your account: http://localhost:${PORT}/users/confirm/${user.userId}`      
      let email = user.email
      sendEmail(email, subject, text, null)
    }
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
  User.findByUserIdAndUpdate(req.params.id, {
    $set: {
      username: req.payload.username,
      email: req.payload.email,
      admin: req.payload.admin,
      password: req.payload.password
    }
  }, function (err, user) {
    if (err) return console.error(err);
    res(formatUser(user, 'user'));
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

export function confirmUserAccount(req, res){
  User.findOneAndUpdate({userId: req.params.TOKEN}, {verified: true}, (user) => {
    // Eventually we can redirect to the front end but for now its just a simple response.
    res('Your account on weeklydev.io has been confirmed!')
  })
}

export function requestPasswordReset(req, res){
  
  // If a token was previously generated, use that instead
  if(!req.auth.credentials.passwordResetToken){
    let pwToken = shortid.generate()
    User.findByUserIdAndUpdate(req.auth.credentials.userId, {passwordResetToken: pwToken}, (err, user) => {
      sendPasswordResetEmail(pwToken)
      res()
    })
  }
  else {
    sendPasswordResetEmail(req.auth.credentials.passwordResetToken) 
    res()
  }

  function sendPasswordResetEmail(token){
    let subject = 'Password Reset for Weeklydev.io'
    let text = `Hey! Click the following link to complete resetting your password: http://${HOST}:${PORT}/users/passwordreset/${token}. If you did not request this password reset, then you can ignore this email. Thanks.`      
    let email = req.auth.credentials.email 
    sendEmail(email, subject, text, null)
  }
}

export function passwordReset(req, res){
  let pwToken = req.params.TOKEN  
  let newPass = req.payload.password
  
  User.findOne({passwordResetToken: pwToken})
    .then(user => {
      console.log(user) 
      if(user.userId === req.auth.credentials.userId){
        user.passwordResetToken = ''
        user.password = req.payload.password
        user.save((err) => {
          if(err)
            return res(err)
          
          res()
        })
      }
      else {
        res(Code.invalidPasswordResetToken)
      }
    })
    .catch(err => {
      console.log('Could not find a user with that password reset token.')
      res(Code.userNotFound)
    })
}
