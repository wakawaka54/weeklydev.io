import * as submissions from './submissions.js';
import submissionSchema from '../../Schemas/Submission.js';

const routes = [
  {
    method: 'GET',
    path: '/submissions',
    config: {
      auth: 'jwt',
      description: 'List all Submissions',
      tags: ['api', 'Submission']
    },
    handler: submissions.getSubmissions
  },
  {
    method: 'POST',
    path: '/submissions/new',
    config: {
      auth: 'jwt',
      description: 'Create a new submissions',
      tags: ['api', 'Submission'],
      validate: {
        payload: submissionSchema
      }
    },
    handler: submissions.addSubmission
  },
  {
    method: 'PUT',
    path: '/submissions/{id}',
    config: {
      auth: 'jwt',
      description: 'Update Submissions',
      tags: ['api', 'Submission'],
      validate: {
        payload: submissionSchema // TOOD: make new schema
      }
    },
    handler: submissions.updateSubmission
  },
  {
    method: 'DELETE',
    path: '/submissions/{id}',
    config: {
      auth: 'jwt',
      description: 'Deletes Submission',
      tags: ['api', 'Submission']
    },
    handler: submissions.deleteSubmission
  }
];

export default routes;
