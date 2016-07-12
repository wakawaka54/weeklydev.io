'use strict';

const Boom = require('boom');
const User = require('../../models/User');
const Team = require('../../../teams/models/Team');
const Survey = require('../../../survey/models/Survey');

module.exports = (req, res) => {
  User.findById(req.Token.id, (err, user) => {
    if (err || !user) {
      res(Boom.unauthorized('user not found'));
    } else {
    }
  });
};
