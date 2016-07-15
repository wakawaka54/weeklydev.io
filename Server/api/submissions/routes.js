import * as submissions from './submissions.js'
import submissionSchema from '../../Schemas/Submission.js'

const routes = [
  {
    method: 'GET',
    path: '/submissions',
    config: {
      auth: 'jwt'
    },
    handler: submissions.getSubmissions
  },
  {
    method: 'POST',
    path: '/submissions/new',
    config: {
      validate: {
        payload: newSubmissionSchema
      },
      auth: 'jwt'
    },
    handler: submissions.addSubmission
  },
  {
    method: 'PUT',
    path: '/submissions/{id}',
    config: {
      validate: {
        payload: submissionSchema // TOOD: make new schema
      },
      auth: 'jwt'
    },
    handler: submissions.updateSubmission
  },
  {
    method: 'DELETE',
    path: '/submissions/{id}',
    config: {
      auth: 'jwt'
    },
    handler: submissions.deleteSubmission
  }
]

export default routes
