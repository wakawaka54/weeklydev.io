'use strict';

const _ = require('../handler');
const createNewSurvey = require('../util/surveySchema');
const surveySchema = require('../schemas/surveySchema');
// const surveySchema = require('../schemas/survey')

module.exports = [{
  method: 'GET',
  path: '/survey',
  config: {
    // Validate the payload against the Joi schema
    // NOTE: Do we need this?
    validate: {
      // payload: surveySchema
    },
    auth: 'jwt'
  },
  handler: _.getSurvey
}, {
  method: 'PUT',
  path: '/survey',
  config: {
    // Validate the payload against the Joi schema
    validate: {
      payload: surveySchema
    },
    auth: 'jwt'
  },
  handler: _.updateSurvey
}, {
  method: 'POST',
  path: '/survey',
  config: {
    // Validate the payload against the Joi schema
    validate: {
      payload: surveySchema
    },
    auth: 'jwt'
  },
  handler: _.addSurvey
}];
