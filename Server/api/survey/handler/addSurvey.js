'use strict';

const Boom = require('boom');
const Survey = require('../models/Survey');
const User = require('../../users/models/User');
const Code = require('../../../config/errorCodes');

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
