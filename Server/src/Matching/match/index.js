import GhostUser from '../../Models/GhostUser';
import GhostTeam from '../../Models/GhostTeam';

const _TZ_OFFSET = 1;
const _PS_OFFSET = 2;
const _SKILL_OFFSET = 2;
const _TEAM_NEED_SKILL_LEVEL_FIVE = 15;
const _TEAM_NEED_SKILL_LEVEL_FOUR = 12;
const _TEAM_NEED_SKILL_LEVEL_THREE = 9;

// For more then 1 role
const PERCENT_TO_GET_PRIMARY_ROLE = 50;
const PERCENT_TO_GET_SECONDARY_ROLE = 30;

const PERCENT_TO_GET_ONLY_ROLE = 70;

const PERCENT_TO_GET_MANGER_ROLE = 20;

// returns at least 1 or more based on offset specified
function getOffset (offset) {
  return Math.round((Math.random() * (offset - 1) + 1));
}
// return the oposit of users skill_level
// (ex. 5 will return 1, and 2 will return 4)
function getUserSkillLevel (x) {
  return Math.abs(x - 6);
}

function getUsersForRole (potentialCandidates, role) {
  let result = [];
  potentialCandidates.forEach((potentailTeammate, array, index) => {
    potentailTeammate.preferred_role.forEach((teammateRole, arra, index) => {
      if (role == 'manager' && potentailTeammate.project_manager) {
        result.push(potentailTeammate);
      }else {
        if (teammateRole.indexOf(role) != -1) {
          result.push(potentailTeammate);
        }
      }
    });
  });
  return result;
}

function randomPercentage (percentage) {
  return (Math.random() < (percentage / 100));
}

function decideUserRole (user, arrOfFreeRoles) {
  if (user.preferred_role.length > 1) {
    if (user.project_manager) {
      return (randomPercentage(PERCENT_TO_GET_PRIMARY_ROLE) ? user.preferred_role[0] :
        (randomPercentage(PERCENT_TO_GET_SECONDARY_ROLE) ? user.preferred_role[1] :
          'manager'));
    }else {
      return (randomPercentage(PERCENT_TO_GET_ONLY_ROLE) ? user.preferred_role[0] : user.preferred_role[1]);
    }
  }else {
    if (user.project_manager) {
      return (!randomPercentage(PERCENT_TO_GET_MANGER_ROLE) ? user.preferred_role[0] : 'manager');
    }else {
      return user.preferred_role[0];
    }
  }
}
function inRange (skillNeed, skill) {
  if (skillNeed === 3) {
    return true;
  }else {
    if (skillNeed < 3) {
      if (skill >= 3) {
        return true;
      }else {
        return false;
      }
    }else {
      if (skillNeed > 3) {
        if (skill < 3) {
          return true;
        }else {
          return false;
        }
      }
    }
  }
}

function removeFromFreeRole (arr, role) {
  arr.splice(arr.indexOf(role), 1);
}
function include (arr, obj) {
  return (arr.indexOf(obj) != -1);
}
function removeUsersIfInTeam (users, teamMemebers) {
  users.forEach((user, index, array) => {
    if (include(teamMemebers, user)) {
      array.splice(index, 1);
    }
  });
  return users;
}
function sort (array, argument) {
  // default argument is skill_level
  if (!argument) {
    argument = 'skill_level';
  }
  array.sort(function (a, b) {
    if (a[argument] > b[argument]) {
      return 1;
    }
    if (a[argument] < b[argument]) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
  return array;
}
function createGhostTeam (userId) {
  GhostUser.find({ userId: userId }, (err, user) => {
    if (err || user.length == 0) {
      console.log(err);
      console.log(user);
      console.log('user not found!');
      return;
    }
    let timeOffset = getOffset(_TZ_OFFSET);
    let projectOffset = getOffset(_PS_OFFSET);
    var User = user[0];
    GhostUser.find({
      userId: { $ne: userId },
      timezone: {$gte: (User.timezone - timeOffset), $lte: (User.timezone + timeOffset) },
    // project_size: {$gte: (User.project_size - projectOffset),$lte: (User.project_size + projectOffset)}
    }).sort({
      timezone: -1,
      skill_level: -1,
      project_size: -1
    }).exec((err, potentialCandidates) => {
      let ghostTeam = new GhostTeam();
      // Decide users role
      let userRole = decideUserRole(User);
      // Push user role to the team
      if (!ghostTeam.hasOwnProperty(userRole)) {
        ghostTeam[userRole] = [];
      }
      ghostTeam[userRole].push(User);
      // Get optimal skill leve
      let userSkillLevel = getUserSkillLevel(User.skill_level);
      // Populate free roles in 5 man team
      const freeRoles = ['backend', 'backend', 'frontend', 'frontend', 'manager'];

      removeFromFreeRole(freeRoles, userRole);

      ghostTeam.score = [User.skill_level];

      potentialCandidates.forEach((potentailTeammate, index, array) => {
        var potentialRole = decideUserRole(potentailTeammate);
        // Check if role is free
        if (include(freeRoles, potentialRole)) {
          if (potentialRole === userRole) {
            if (inRange(userSkillLevel, potentailTeammate.skill_level)) {
              ghostTeam[potentialRole].push(potentailTeammate);
              removeFromFreeRole(freeRoles, potentialRole);
            }
          }else {
            if (freeRoles[0] !== 'manager') {
              if (ghostTeam[potentialRole].length >= 1) {
                if (inRange(getUserSkillLevel(ghostTeam[potentialRole][0]), potentailTeammate.skill_level)) {
                  ghostTeam[potentialRole].push(potentailTeammate);
                  removeFromFreeRole(freeRoles, potentialRole);
                }
              }else {
                ghostTeam[potentialRole].push(potentailTeammate);
                removeFromFreeRole(freeRoles, potentialRole);
              }
            }else {
              ghostTeam[potentialRole].push(potentailTeammate);
              removeFromFreeRole(freeRoles, potentialRole);
            }
          }
        }
      });

      if (freeRoles.length >= 0) {
        for (var i = 0; i < freeRoles.length; i++) {
          let potentailTeammate = removeUsersIfInTeam(sort(getUsersForRole(potentialCandidates, freeRoles[i])), ghostTeam.members);

          let Teammate = potentailTeammate[0];
          ghostTeam[freeRoles[i]].push(Teammate);
        }
      }
      ghostTeam.save((err, team) => {
        if (err) {
          return err;
        }
        if (!team) {
          return new Error('Something went wrong when saving team');
        }
        process.stdout.write('.');
      });
    });
  });
}

export default createGhostTeam;
