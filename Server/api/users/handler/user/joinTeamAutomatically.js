'use strict';

const Boom = require('boom');
const User = require('../../models/User');
const Code = require(PATH + '/config/errorCodes');
const Team = require('../../../teams/models/Team');
const Survey = require('../../../survey/models/Survey');
const ghostUser = require(PATH + '/Matching/models/searchingUsers');

function addToGhost (survey) {
  var ghost = new ghostUser();
  ghost.userId = survey.user_id;
  ghost.preferred_role = survey.preferred_role;
  ghost.project_manager = survey.project_manager;
  ghost.skill_level = survey.skill_level;
  ghost.project_size = survey.project_size;
  ghost.timezone = survey.timezone;
  ghost.save(err => {
    if (err) {
      console.log(err);
    }
  });
}
module.exports = (req, res) => {
  // TODO: add check for email confirmation
  Survey.findByUserId(req.Token.id, (err, survey) => {
    if (err || !survey) {
      res(Code.surveyNotFound);
    } else {
      addToGhost(survey);
    }
  });
};
