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

/**
Maximum accepted variance between users
  This value is dependent on the values of matchingImportance
**/
const maxMatchThreshold = 2;

/**
Eligible matchmaking user query
Match users that are searching [isSearching: true],
and have not already been matched to a ghostTeam,
and have filled out their survey (NOT IMPLEMENTED)
**/
const userQuery = { $and: [
  { 'isSearching': true},
  {$or: [{'ghostTeam': null},
  {'ghostTeam': {$exists: false}}]}
]};

var totalUsers = -100;

export async function startMatchmaking()
{
  try
  {
    await countUsers();

    for(let i = 0; i != 1; i++) {
    let seedUser = await randomUsers(1);
    let ghostTeam = await assembleGhostTeam(seedUser);
    }

  }
  catch(err) {
    console.log(err);
  }
}

/**
Assembles a ghost team from the seed user that is passed into the function
[seedUser] => First user in the team, base the team around this user, usually randomly picked from database
Returns: GhostTeam with matched users or returns null if users could not be matched after several tries
**/
async function assembleGhostTeam(seedUser) {

  var ghostTeam = new GhostTeam();

  //Maintain array of users to compare survey
  var users = [];

  //Copy team layout
  let roles = teamLayout.slice();

  let user = seedUser;

  //don't iterate through finding a user more than 20 times
  let iterations = 0;

  for(let i = 0; i < 20 && roles.length != 0; i++)
  {
    //strange bug causes object to turn into double array
    if(i == 0) { user = user[0][0]; }
    else if(user == null) { break; }
    else { user = user[0]; }

    //push user to running user collection
    users.push(user);

    //pick user role
    let role = pickUserRole(user, roles);

    //add it to ghost team and remove from available roles
    ghostTeam.users.push(role);
    roles = removeFrom(role.role, roles);

    //get a new matched user
    user = await findUserMatch(users);
    let l = 0;
    while(user == null && l++ != 5) { user = await findUserMatch(users); }
  }

  //if we have a full ghostTeam - rejoice
  if(roles.length == 0)
  {
    ghostTeam = await ghostTeam.save();
    ghostTeam = await GhostTeam.find({_id: ghostTeam._id}).populate({path: 'users.id'}).exec();
    ghostTeam = ghostTeam[0];
    for(let i = 0; i != ghostTeam.users.length; i++)
    {
      console.log(ghostTeam.users[i]);
    }

    return ghostTeam;
  }
  else {
    console.log(`Matchmaking did not converge - ${ghostTeam}`);
    return null;
  }
}

/**
Counts users that meet the matchmaking criteria
Returns: Count of users that are eligible for match making
**/
async function countUsers() {
    totalUsers = await User.find(userQuery).count().exec();
    return totalUsers;
  }

/**
Randomly picks a certain number of users from the datastore
[count] => number of users to randomly pick
Returns: Array of User
**/
async function randomUsers(count) {
  console.info("Retrieving random user");

  let users = [];

  console.info(`Total User Count: ${totalUsers}`);

  for(let i = 0; i != count; i++)
  {
    let random = Math.ceil(Math.random() * totalUsers);
    let user = await User.find(userQuery).limit(1).skip(random).exec();

    users.push(user);
  }

  //console.info(`Users retrieved: ${users}`);
  return users;
}

/**
Uses matchmaking algorithm to match new user to current team
[users] => current list of users in the team
Returns: matched User or null if couldn't find a match
**/
async function findUserMatch(users) {
  let overallSkill = getUsersSkill(users);
  let ranUsers = await randomUsers(10);
  let matchCount = [];

  //Get the match score from every user
  for(let i = 0; i != ranUsers.length; i++)
  {
    //strange bug causes double array
    //ranUsers = ranUsers[0];

    if(ranUsers[i] == null) { console.log(`********************* Undefined user in ... ${ranUsers[i]}`); matchCount.push(10000); continue; }

    console.log('Retrieving Ran User');
    let user = ranUsers[i][0];

    if(user == undefined || user.survey == undefined) { console.log(`********************* Undefined user in ... ${ranUsers[i]}`); matchCount.push(10000); continue; }

    let survey = user.survey;
    let match = Math.abs(overallSkill.skill_level - survey.skill_level) * matchingImportance[0];
    match += Math.abs(overallSkill.project_size - survey.project_size) * matchingImportance[1];
    match += Math.abs(overallSkill.timezone - survey.timezone) * matchingImportance[1];

    //If the user is already on the team, make the match a really high number
    if(users.filter((user) => ranUsers[i].id == user.id).length > 0) { match = 100000; }

    matchCount.push(match);
  }

  let minMatch = Math.min(...matchCount);
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

/**
Used to randomly pick user role from user survey roles and available team roles
[user] => User object with Survey populated
[roles] => Available team roles
Returns: object { id: User._id, role: UserRoleInGhostTeam }
**/
function pickUserRole(user, roles) {
  let role = {};

  //verify that available roles are in user roles
  if(!hasMatchRoles(user.survey.role, roles)) { return new Error({ message: 'User roles are not in available roles'}); }

  //keep picking random roles until a random role matches the available roles
  do {
    role = randomizeOptions(user.survey.role, roleProbabilities);
  } while (roles.indexOf(role) == -1);

  //return this in the format that can be pushed onto GhostTeam users property
  let retOb = {
    id: user.id,
    role: role
  };

  return retOb;
}

/**
Make sure that rolesA has one or more elemnts included in rolesB
Used to make sure that user roles are present in available team roles
[rolesA] -> User roles ['frontend', 'backend']
[rolesB] -> Available roles ['manager', 'backend']
Returns: true or false
**/
function hasMatchRoles(rolesA, rolesB) {
  for(let i = 0; i != rolesA.length; i++)
  {
    if(rolesB.indexOf(rolesA[i]) != -1) { return true; }
  }

  return false;
}

/**
Used to pick random roles
[options] => options that probabilities coorespond to, ['frontend', 'backend', etc...]
[probabilities] => probabilities of options, between 0 and 1, [.5, .7, .2]
Number of options must match number of probabilities
Returns: options[random]
**/
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

/**
Utility method to remove a value from an array
[value] => value to remove from array
[array] => array to remove from
Returns: Modified array with removed value
**/
function removeFrom(value, array) {
  let indexOf = array.indexOf(value);
  if(indexOf == -1) { return array; }
  array.splice(indexOf, 1);

  return array;
}
