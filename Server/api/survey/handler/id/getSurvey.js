'use strict';

const Boom = require('boom');
const Survey = require(global.PATH + '/api/survey/models/Survey');

module.exports = (req, res) => {
  Survey.findById(req.params.id, function (err, survey) {
    if (err) {
      res(Boom.badRequest(err));
    }
    res(survey);
  });
};
