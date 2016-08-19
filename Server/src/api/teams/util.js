import User from '../../Models/User.js';
import Project from '../../Models/Project.js';
import { validateUser, validateProject } from '../../Utils/validation.js';

export function addToUserScope(userid, scope)
{
  User.findOne({_id : userid}, (err, user) => {
    if(user)
    {
      user.scope.push(scope);
      user.save();
    }
  });
}

export function removeFromUserScope(userid, scope)
{
  User.findOne({_id : userid}, (err, user) => {
    if(user)
    {
      let index = user.scope.indexOf(scope);
      if(index != -1) { user.scope.splice(index, 1); }
      user.save();
    }
  });
}

export function addTeamToProject(teamId, projectId)
{
  Project.findById({_id: projectId}, (err, project) => {
    project.team = teamId;
    project.save();
  });
}

export function removeTeamFromProject(teamId, projectId)
{
  Project.findById({_id: projectId}, (err, project) => {
    project.team = null;
    project.save();
  });
}

export function checkArrayLength (role, role_level) {
  if (role.length !== role_level.length) {
    return false;
  }else {
    return true;
  }
};

export function roleCompare (role, role_level) {
  let arr = [];
  for (var i = 0; i < role.length; i++) {
    arr.push({user: role[i], role: role_level[i]});
  }
  return arr;
};

// return true if the arrays are the same lenght
// otherwise return false
export function arrayChecker (role, role_level) {
  if (checkArrayLength(role, role_level)) {
    for (var i = 0; i < role.length; i++) {
      if (!checkArrayLength(role[i], role_level[i])) {
        return false;
      }
    }
    return true;
  }
};

export function findUserInTeam (user, members) {
  for(let i = 0; i != members.length; i++)
  {
    if(members[i].user == user) return true;
  }
  return false;
};

export function findUserInRequests(user, members) {
  for(let i = 0; i != members.length; i++)
  {
    if(members[i].user == user) return true;
  }
  return false;
}

export function validateUserId (req, res) {
  if (req.payload.user) {
    validateUser(req.payload.user, (err, response) => {
      if (err) {
        res(err);
      }else {
        res(response);
      }
    });
  }else {
    res();
  }
};

/*
export function validateUpdateProject(req, res)
{
  if(req.payload.project)
  {
    validateProject(req.payload.project, (err, project) => {
      if(err) { return res(false); }
      if(project && project.team != null) { return res(false); }
      return res(true);
    });
  }
  else { return res(true);}
}*/

export function validateUpdateUser(req, res)
{
  if(req.payload.manager)
  {
    validateUser(req.payload.manager, (err, response) => {
      if(err) { return res(false); }
      return res(true);
    });
  }
  else { return res(true); }
}

export function validateProjectId (req, res) {
  if(req.params.pid) {
    validateProject(req.params.id, (err, response) =>{
      if(err) { res(err); }
      else {
        res(response);
      }
    });
  }
  else {
    res();
  }
};
