import User from '../../Models/User.js';
import Project from '../../Models/Project.js';
import { validateUser, validateProject } from '../../Utils/validation.js';

export function validateUpvoteProjectId (req, res) {
  validateProject(req.params.id, (err, project) =>
  {
    if(err) { return res(null); }
    res(project);
  });
};
