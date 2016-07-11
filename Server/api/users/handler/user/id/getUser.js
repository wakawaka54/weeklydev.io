'use strict';

const Boom = require('boom');
const User = require('../../../models/User');
const Code = require(`${PATH}/config/errorCodes`);
const formatUser = require('../../../util/userFunctions').formatUser;

module.exports = (req, res) => {
  User.findById(req.params.id, function (err, user) {
    if (err || !user) {
      res(Code.userNotFound);
      return;
    }
    res(formatUser(user, 'users')).code(200);
  });
};
