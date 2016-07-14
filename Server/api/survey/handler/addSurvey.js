'use strict';

const Boom = require('boom');
const Survey = require('../models/Survey');
const User = require('../../users/models/User');
const Code = require('../../../config/errorCodes');
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
  User.findById(req.Token.id, (err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    } else {
      if (user.survey) {
        res('Survey already submitted!');
      }else {
        let payload = req.payload;
        let survey = new Survey();
        survey.user_id = user.id;
        survey.preferred_role = payload.role;
        survey.project_manager = payload.projectManager;
        survey.skill_level = payload.skill;
        survey.project_size = payload.size;
        survey.timezone = payload.timezone;
        survey.save((err, survey) => {
          if (err) {
            throw Boom.badRequest(err);
          }
          addToGhost(survey);
          user.survey = survey.id;
          user.save(err => {
            if (err) {
              console.log(err);
            }else {
              res(survey);
            }
          });
        });
      }}
  });
};
