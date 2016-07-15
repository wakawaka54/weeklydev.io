'use strict';

const Boom = require('boom');
const User = require('../../models/User');
const Code = require(PATH + '/config/errorCodes');

module.exports = (req, res) => {
  User.findById(req.Token.id).populate('ghostTeams', 'confirmed manager frontend backend score').exec((err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    }else {
      res(user.ghostTeams);
    }
  });
};
