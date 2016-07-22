import Boom from 'boom';
import Survey from '../../Models/Survey.js';
import User from '../../Models/User.js';
import * as Code from '../../Utils/errorCodes.js';

/*
 * Add a survey
 */
export function addSurvey (req, res) {
  User.findById(req.Token.id, (err, user) => {
    if (err || !user) {
      res(Code.userNotFound);
    } else {
      if (user.survey) {
        res('Survey already submitted!');
      }else {
        let payload = req.payload;
        let survey = new Survey({
          user_id: user.id,
          role: payload.role,
          project_manager: payload.project_manager,
          skill_level: payload.skill_level,
          project_size: payload.project_size,
          timezone: payload.timezone
        });
        survey.save((err, survey) => {
          if (err) {
            throw Boom.badRequest(err);
          }
          user.survey = survey.id;
          user.save(err => {
            if (err) {
              console.log(err);
            }else {
              res(survey.toObject());
            }
          });
        });
      }}
  });
};

/*
 * Get a survey
 */
export function getSurvey (req, res) {
  Survey.findOne({
    user_id: req.Token.id
  }, (err, survey) => {
    res(((survey) ? survey.toObject() : {
      error: 'No Survey found!'
    })).code(200);
  });
};

/*
 * Update a survey
 */
export function updateSurvey (req, res) {
  let payload = req.payload;
  Survey.findOneAndUpdate({
    user_id: req.Token.id
  }, {
    user_id: req.Token.id,
    role: payload.role,
    project_manager: payload.project_manager,
    skill_level: payload.skill_level,
    project_size: payload.project_size,
    timezone: payload.timezone
  }, (err, survey) => {
    if (err) {
      res(Boom.badRequest(err));
    }
    if (!survey) {
      res(Boom.unauthorized('Survey not found'));
    }
    User.findByIdAndUpdate(req.Token.id, {
      survey_id: survey.id
    }, (err, user) => {
      if (err) {
        res(Boom.badRequest(err));
      }
      if (!user) {
        res(Boom.unauthorized('User not found'));
      }
      user.save((err) => {
        if (err) {
          res(Boom.badRequest(err));
        }
        res(survey.toObject());
      });
    });
  });
};
