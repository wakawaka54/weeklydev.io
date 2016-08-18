import * as projects from './projects.js';
import { projectSchema, projectUpdateSchema } from '../../Schemas/Project.js';
import * as utils from './util.js';

const routes = [
  {
    // Return all documents from the projects collection
    method: 'GET',
    path: '/projects',
    config: {
      auth: 'jwt',
      description: 'List all available projects',
      tags: ['api', 'Projects']
    },
    handler: projects.getProjects
  },
  {
    // Get a project by that project's object ID
    method: 'GET',
    path: '/projects/{id}',
    config: {
      auth: 'jwt',
      description: 'Get project details by Id',
      notes: 'Get specifics projects details by Id',
      tags: ['api', 'Projects']
    },
    handler: projects.getProject
  },
  {
    method: 'POST',
    path: '/projects',
    config: {
      auth: 'jwt',
      description: 'Create a new project',
      tags: ['api', 'Projects'],
      validate: {
        payload: projectSchema
      }
    },
    handler: projects.addProject
  },
  {
    method: 'PUT',
    path: '/projects/{id}',
    config: {
      auth: 'jwt',
      description: 'Update Project',
      tags: ['api', 'Projects'],
      validate: {
        payload: projectUpdateSchema
      }
    },
    handler: projects.updateProject
  },
  {
    method: 'DELETE',
    path: '/projects/{id}',
    config: {
      auth: 'jwt',
      description: 'Delete Project',
      tags: ['api', 'Projects']
    },
    handler: projects.deleteProject
  },
  {
    method: 'POST',
    path: '/projects/{id}/upvote',
    config: {
      auth: 'jwt',
      description: 'Delete Project',
      tags: ['api', 'Projects'],
      pre:
        [{ method: utils.validateUpvoteProjectId,  assign: 'project' }]
    },
    handler: projects.upvoteProject
  },
  {
    method: 'POST',
    path: '/projects/{id}/downvote',
    config: {
      auth: 'jwt',
      description: 'Delete Project',
      tags: ['api', 'Projects'],
      pre:
        [{ method: utils.validateUpvoteProjectId,  assign: 'project' }]
    },
    handler: projects.downvoteProject
  }
];

export default routes;
