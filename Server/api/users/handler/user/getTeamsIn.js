'use strict';

const Boom = require('boom');
const User = require('../../models/User');
const Code = require(PATH + '/config/errorCodes');
const Team = require('../../../teams/models/Team');
const formatUser = require('../../util/userFunctions').formatUser;

module.exports = (req, res) => {
  User.findById(req.Token.id).populate('team').exec((err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    }else {
      res(user.team);
    }
  });
};
