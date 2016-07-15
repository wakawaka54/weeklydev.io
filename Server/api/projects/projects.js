import Project from '../../Models/Project.js'

/*
 * Get projects
 */
export function getProjects(req, res){
  Project.find((err, projects) => {
    if (err) return console.error(err);
    res(projects);
  });
}

/*
 * Add a  project
 */
export function addProject(req, res){
  let project = new Project();

  project.title = req.payload.title,
  project.details = req.payload.details;
  if (req.payload.deadline) {
    project.deadline = req.payload.deadline;
  }

  project.save((err, project) => {
    if (err) return console.log(err);
    res(newProject);
  });
}


/*
 * Get a  project
 */
export function getProject(req, res){
  Project.findById(req.params.id, (err, project) => {
    if (err){
      console.error(err);
      // Todo change to actual boom error
      res(error)
    } 
    res(project);
  });
}


/*
 * Update a  project
 */
export function updateProject(req, res){
  function update () {
    let obj = {};
    if (req.payload.title) {
      obj.title = req.payload.title;
    }
    if (req.payload.details) {
      obj.details = req.payload.title;
    }
    if (req.payload.deadline) {
      obj.deadline = req.payload.deadline;
    }
    return obj;
  }
  Project.findByIdAndUpdate(req.params.id, update, (err, project) => {
    if (err) {
      res(Boom.badRequest('project not found!'));
    }else {
      res(project);
    }
  });
}
