import * as projects from './projects.js'
import projectSchema from '../../Schemas/Project.js'

export default const routes = [
  {
    // Return all documents from the projects collection
    method: 'GET',
    path: '/projects',
    config: {
      auth: 'jwt'
    },
    handler: projects.getProjects
  },
  {
    // Get a project by that project's object ID
    method: 'GET',
    path: '/projects/{id}',
    config: {
      auth: 'jwt'
    },
    handler: projects.getProject
  },
  {
    method: 'POST',
    path: '/projects/add',
    config: {
      validate: {
        payload: projectSchema
      },
      auth: 'jwt'
    },
    handler: projects.addProject
  },
  {
    method: 'PUT',
    path: '/projects/{id}',
    config: {
      validate: {
        payload: projectSchema
      },
      auth: 'jwt'
    },
    handler: projects.updateProject
  }
]
