import * as projects from './projects.js';
import projectSchema from '../../Schemas/Project.js';

const routes = [
  {
    // Return all documents from the projects collection
    method: 'GET',
    path: '/projects',
    config: {
      auth: 'jwt',
      description: 'List all avaible projects',
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
    path: '/projects/add',
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
        payload: projectSchema
      }
    },
    handler: projects.updateProject
  }
];

export default routes;
