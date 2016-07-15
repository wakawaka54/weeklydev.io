import * as surveys from './surveys.js'
import surveySchema from '../../Schemas/Survey.js'

const routes = [
  {
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
    handler: surveys.getSurvey
  },
  {
    method: 'PUT',
    path: '/survey',
    config: {
      // Validate the payload against the Joi schema
      validate: {
        payload: surveySchema
      },
      auth: 'jwt'
    },
    handler: surveys.updateSurvey
  },
  {
    method: 'POST',
    path: '/survey',
    config: {
      // Validate the payload against the Joi schema
      validate: {
        payload: surveySchema
      },
      auth: 'jwt'
    },
    handler: surveys.addSurvey
  }
]

export default routes
