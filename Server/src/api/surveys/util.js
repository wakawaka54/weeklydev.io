import Survey from '../../Models/Survey.js'
import Boom from 'boom'

export function createNewSurvey(req, res){
  Survey.findOne({
    user_id: req.Token.id
  }, (err, survey) => {
    if (err) {
      res(Boom.badRequest('Invalid query'));
    }
    if (!survey || !survey == null) {
      res(req.payload);
      return;
    } else {
      res(Boom.badRequest('To update your survey use PUT!'));
    }
  });
}
