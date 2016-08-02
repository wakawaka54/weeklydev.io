import Boom from 'boom';
// import Survey from '../../Models/Survey.js';
import User from '../../Models/User.js';
import * as Code from '../../Utils/errorCodes.js';

/*
 * Add a survey
 */
// export function addSurvey (req, res) {
//   User.findById(req.Token.id, (err, user) => {
//     if (err || !user) {
//       res(Code.userNotFound);
//     } else {
//       if (user.survey) {
//         res('Survey already submitted!');
//       } else {
//         let payload = req.payload;
//         user.survey = {
//           role: payload.role,
//           project_manager: payload.project_manager,
//           skill_level: payload.skill_level,
//           project_size: payload.project_size,
//           timezone: payload.timezone
//         };
//         user.save((err, _user) => {
//           if (err) {
//             throw Boom.badRequest(err);
//           } else {
//             res(user.survey.toObject());
//           }
//         });
//       }
//     }
//   });
// };

/*
 * Get a survey
 */
export function getSurvey (req, res) {
  User.findById(req.Token.id, (err, user) => {
    if (user.survey) {
      res(user.survey.toObject()).code(200);
    } else {
      // res({ error: 'No Survey found!' }).code(200);
      res({ error: 'No Survey found!' });
    }
  });
};

/*
 * Update a survey
 */
export function updateSurvey (req, res) {
  let survey = req.payload;
  User.findByIdAndUpdate(req.Token.id, {
    survey
  }, { new: true, upsert: true }, (err, user) => {
    if (err) {
      res(Boom.badRequest(err));
    } else if (!user.survey) {
      res(Boom.unauthorized('Survey not found'));
    } else {
      res(user.survey.toObject());
    }
  });
};
