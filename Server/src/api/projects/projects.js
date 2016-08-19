import Project from '../../Models/Project.js';
import Team from '../../Models/Team.js';
import Boom from 'boom';

/*
 * Get projects
 */
export function getProjects (req, res) {
  Project.find((err, projects) => {
    if (err) return console.error(err);
    res(projects);
  });
};

/*
 * Add a  project
 */
export function addProject (req, res) {
  //Create new ProjectModel
  let project = new Project();

  project.title = req.payload.title,
  project.description = req.payload.description;
  project.tags = req.payload.tags;
  project.creator = req.auth.credentials.id;

  if(req.payload.manager && req.payload.manager == true)
  {
    let team = new Team();
    team.project = project._id;
    //TODO: Change TeamSchema and add user to manager

    project.team = team._id;
  }

  if (req.payload.deadline) {
    project.deadline = req.payload.deadline;
  }

  if(req.payload.public) {
    project.public = req.payload.public;
  }

  project.save((err, newProject) => {
    if (err) return console.log(err);
    res(newProject);
  });
};

/*
 * Get a  project
 */
export function getProject (req, res) {
  Project.findById(req.params.id, (err, project) => {
    if (err) {
      console.error(err);
      // Todo change to actual boom error
      res(error);
    }
    res(project);
  });
};

/*
 * Update a  project
 */
export function updateProject (req, res) {
  Project.findByIdAndUpdate(req.params.id, req.payload, (err, project) => {
    if (err) {
      res(Boom.badRequest('project not found!'));
    }
    else {
      //Overwrite FOUND document properties with update object
      for(let attrname in req.payload) { project[attrname] = req.payload[attrname]; }
      res(project);
    }
  });
};

export function deleteProject(req, res) {
  Project.findOneAndRemove({_id: req.params.id}, (err, callback) => {
    if(err) { Boom.badImplementation("Error removing project"); }
    res({statusCode:200});
  });
};

export function upvoteProject(req, res) {
  if(req.pre.project == null) { res(Boom.badRequest("Project invalid")); }

  let project = req.pre.project;

  //make sure user has not already upvoted
  if(project.upvotes.indexOf(req.auth.credentials.id) != -1) { return res(Boom.conflict('User has already upvoted')); }

  //add user id to upvotes
  project.upvotes.push(req.auth.credentials.id);

  //check downvotes to make sure user is not there
  let downvoteIndex = project.downvotes.indexOf(req.auth.credentials.id);
  if(downvoteIndex != -1) { project.downvotes.splice(downvoteIndex, 1); }

  req.pre.project.save()
  .then((project) => res(project))
  .catch((err) => res(Boom.badImplementation(err)));
}

export function downvoteProject(req, res) {
  if(req.pre.project == null) { res(Boom.badRequest("Project invalid")); }

  let project = req.pre.project;

  //make sure user has not already downvoted
  if(project.downvotes.indexOf(req.auth.credentials.id) != -1) { return res(Boom.conflict('User has already downvoted')); }

  //add user id to downvotes
  project.downvotes.push(req.auth.credentials.id);

  //check upvotes to make sure user is not there
  let upvoteIndex = project.upvotes.indexOf(req.auth.credentials.id);
  if(upvoteIndex != -1) { project.upvotes.splice(upvoteIndex, 1); }

  req.pre.project.save()
  .then((project) => res(project))
  .catch((err) => res(Boom.badImplementation(err)));
}
