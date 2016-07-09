'use strict';

const Boom = require('boom');
const Team = require('../models/Team');
const Code = require('../../../config/errorCodes');
const validateUser = require(`${PATH}/methods/validateUser`);

module.exports = (req, res) => {
  var team = new Team();
  team['owner'] = req.Token.id;
  if (req.payload.role) {
    var usersProcessed = 0;
    var stop = false;
    req.payload.role.forEach((user, index, array) => {
      validateUser(user.id, valid => {
        if (!stop) {
          if (valid) {
            team[user.role].push(user.id);
            team.meta['members'].push({id: user.id});
            usersProcessed++;
            if (usersProcessed === array.length) {
              saveTeam();
            }
          }else {
            stop = true;
            res(Code.userNotFound);
          }
        }
      });
    });
  }else {
    saveTeam();
  }
  function saveTeam () {
    team.save((err, team) => {
      if (err) {
        console.log(err);
        res(Boom.badImplementation(err));
      }else {
        res(team);
      }
    });
  }
};
