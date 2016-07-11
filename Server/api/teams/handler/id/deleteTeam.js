'use strict';

const Boom = require('boom');
const Team = require('../../models/Team');
const Code = require('../../../../config/errorCodes');

module.exports = (req, res) => {
  Team.findByIdAndRemove(req.params.id, (err, team) => {
    if (err || !team) {
      // Team not found
      res(Code.teamNotFound);
    }else {
      res({msg: 'success', team: team});
    }
  });
};
