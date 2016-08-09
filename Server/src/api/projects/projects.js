import Project from '../../Models/Project.js';
import Team from '../../Models/Team.js';

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
  function update (req) {
    let obj = {};
    if (req.payload.title) {
      obj.title = req.payload.title;
    }
    if (req.payload.details) {
      obj.description = req.payload.description;
    }
    if (req.payload.deadline) {
      obj.deadline = req.payload.deadline;
    }
    return obj;
  }
  Project.findByIdAndUpdate(req.params.id, update(req), (err, project) => {
    if (err) {
      res(Boom.badRequest('project not found!'));
    }else {
      res(project);
    }
  });
};
