import User from '../../Models/User';
import Team from '../../Models/Team';
import GhostTeam from '../../Models/GhostTeam';


const teamLayout = ['backend', 'backend', 'frontend', 'frontend', 'manager'];
const roleProbabilities = [.7, .5, .2];

/*
Indicates how important the survey questions are.
      [skill_level, project_size, timezone]
*/
const matchingImportance = [1, .5, .9];
const maxMatchThreshold = 2;

var totalUsers = 0;

export function startMatchmaking()
{
    console.info('Match making starting...');

    countUsers(() => {
      for(let i = 0; i != 10; i++) {
      let seedUser = randomUsers(1);
      let ghostTeam = assembleGhostTeam(seedUser);
      }
    });
}

function countUsers(cb) {
    User.find({$and:[{ 'isSearching': true}, {'ghostTeams':null}]}).count().exec()
    .then((count) => {
      totalUsers = count;
      cb();
    });
  }

function randomUsers(count) {
  console.info("Retrieving random user");

  let users = [];

  console.info(`Total User Count: ${totalUsers}`);

  let promises = [];

  for(let i = 0; i != count; i++)
  {
    let random = Math.ceil(Math.random() * totalUsers);
    let user = User.find({$and:[{ 'isSearching': true}, {'ghostTeams':null}]}).limit(1).skip(random).exec()
    .catch((err) => {
      console.log('error');
      return;
     })
    .then((_user) => {
      console.log(_user);
       users.push(_user);
     });

    promises.push(user);
  }

  console.log(promises);
  Promise.all(promises[0])
  .then(() => {
    console.info(`Users retrieved: ${users}`);
    return users;
  });
}

function assembleGhostTeam(seedUser) {
  var ghostTeam = new GhostTeam();

  //Maintain array of users to compare survey
  var users = [];

  //Copy team layout
  let roles = teamLayout.slice();

  let user = seedUser;

  //don't iterate through finding a user more than 20 times
  let iterations = 0;

  do{
    //push user to running user collection
    users.push(user);

    //pick user role
    let role = pickUserRole(user, roles);

    //add it to ghost team and remove from available roles
    ghostTeam.users.push(role);
    roles = removeFrom(role.role, roles);

    user = findUserMatch(users);
  } while(roles.length != 0 && iterations < 20);

  //if we have a full ghostTeam - party
  if(roles.length == 0)
  {
    console.log(`FULL GHOST TEAM: ${ghostTeam}`);
  }
  else {
    console.log(`Matchmaking did not converge - ${ghostTeam}`);
  }
}

function findUserMatch(users) {
  let overallSkill = getUsersSkill(users);
  let ranUsers = randomUsers(10);
  let matchCount = [];

  //Get the match score from every user
  for(let i = 0; i != ranUsers.length; i++)
  {
    let survey = ranUsers[i].survey;
    let match = (overallSkill.skill_level - survey.skill_level) * matchingImportance[0];
    match += (overallSkill.project_size - survey.project_size) * matchingImportance[1];
    match += (overallSkill.timezone - survey.timezone) * matchingImportance[1];

    //If the user is already on the team, make the match a really high number
    if(users.filter((user) => ranUsers[i].id == user.id).length > 0) { match = 100000; }

    matchCount.push(match);
  }

  let minMatch = min(matchCount);
  if(minMatch > maxMatchThreshold) { return null; }

  //Get the minimal match score and thats the best match
  let indexOf = matchCount.indexOf(minMatch);

  return ranUsers[indexOf];
}

function getUsersSkill(users){

  let overallSkill = {
    skill_level: 0,
    project_size: 0,
    timezone: 0
  };

  for(let i = 0; i != users.length; i++) {
    overallSkill.skill_level += users[i].survey.skill_level;
    overallSkill.project_size += users[i].survey.project_size;
    overallSkill.timezone += users[i].survey.timezone;
  }

  overallSkill.skill_level /= users.length;
  overallSkill.project_size /= users.length;
  overallSkill.timezone /= users.length;

  return overallSkill;
}

function removeFrom(value, array) {
  let indexOf = array.indexOf(value);
  array.splice(indexOf, 1);

  return array;
}

function pickUserRole(user, roles) {
  let role = {};

  //verify that available roles are in user roles
  if(!hasMatchRoles(user.survey.role, roles)) { return new Error({ message: 'User roles are not in available roles'}); }

  //keep picking random roles until
  do {
    role = randomizeOptions(user.survey.role, roleProbabilities);
  } while (roles.indexOf(role) == -1);

  let retOb = {
    id: user.id,
    role: role
  };

  return retOb;
}

function hasMatchRoles(rolesA, rolesB) {
  for(let i = 0; i != rolesA.length; i++)
  {
    if(rolesB.indexOf(rolesA[i]) != -1) { return true; }
  }

  return false;
}

//Used to pick random roles
function randomizeOptions(options, probabilities) {
  if(probabilities.length < options.length) { return new Error({ message: 'Probabilities must be greater than our equal to length of options' }) ; }

  //infinite loop until probability has been realized
  while(true)
  {
    for(let i = 0; i != options.length; i++)
    {
      if(probabilities[i] > Math.random())
      {
        return options[i];
      }
    }
  }
}
