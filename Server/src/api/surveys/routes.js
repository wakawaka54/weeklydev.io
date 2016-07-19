import * as surveys from './surveys.js';
import surveySchema from '../../Schemas/Survey.js';

const routes = [
  {
    method: 'GET',
    path: '/survey',
    config: {
      auth: 'jwt',
      description: 'Return current users survey',
      tags: ['api', 'Survey']
    },
    handler: surveys.getSurvey
  },
  {
    method: 'PUT',
    path: '/survey',
    config: {
      auth: 'jwt',
      description: 'Update Survey',
      notes: 'Updates the survey',
      tags: ['api', 'Survey'],
      validate: {
        payload: surveySchema
      }
    },
    handler: surveys.updateSurvey
  },
  {
    method: 'POST',
    path: '/survey',
    config: {
      auth: 'jwt',
      description: 'Create a new Survey',
      notes: "Create a new Survey Response used in matchmaking to determine your optimal **Team**. \n\nPS: you're Welcome",
      tags: ['api', 'Survey'],
      validate: {
        payload: surveySchema
      }
    },
    handler: surveys.addSurvey
  }
];

export default routes;
