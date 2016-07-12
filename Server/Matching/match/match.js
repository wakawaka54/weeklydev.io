'use strict';

const User = require('../../api/users/models/User');
const Team = require('../../api/teams/models/Team');
const Survey = require('../../api/survey/models/Survey');

const ghostUser = require('../models/searchingUsers');
const ghostTeam = require('../models/ghostTeam');

const _TZ_OFFSET = 1;
const _PS_OFFSET = 2;
const _SKILL_OFFSET = 2;
const _TEAM_NEED_SKILL_LEVEL_FIVE = 15;
const _TEAM_NEED_SKILL_LEVEL_FOUR = 12;
const _TEAM_NEED_SKILL_LEVEL_THREE = 9;

var offsetMinus;

function getOffset (offset) {
  return Math.round((Math.random() * (offset - 1) + 1));
}

function getUserSkillLevel (x) {
  return Math.abs(x - 6);
}

function find_Users_With_Any_Skill_Level_And_Same_Role (potentialCandidates, role) {
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

function decideUserRole (user, arrOfFreeRoles) {
  if (user.preferred_role.length > 1) {
    if (user.project_manager) {
      if (Math.random() < 0.40) {
        return user.preferred_role[0];
      }else {
        if (Math.random() < 0.40) {
          return user.preferred_role[1];
        }else {
          return 'manager';
        }
      }
    }else {
      if (Math.random() < 0.70) {
        return user.preferred_role[0];
      }else {
        return user.preferred_role[1];
      }
    }
  }else {
    if (user.project_manager) {
      if (Math.random() < 0.80) {
        return user.preferred_role[0];
      }else {
        return 'manager';
      }
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

function format (_Team) {
  console.log(`
Backend----Frontend----Manager
${_Team.backend.length} / ${_Team.frontend.length} / ${_Team.manager.length}
    Team Size: ${_Team.getTeamSize()}
    Score: ${_Team.getScore()/_Team.getTeamSize()}
    Timezones: ${_Team.getTimezones()}`);
}

function removeFromFreeRole (arr, role) {
  arr.splice(arr.indexOf(role), 1);
}
function include (arr, obj) {
  return (arr.indexOf(obj) != -1);
}
function doSomething (userId) {
  ghostUser.find({ user: userId }, (err, user) => {
    if (err || user.length == 0) {
      console.log('user not found!');
      return;
    }
    let timeOffset = getOffset(_TZ_OFFSET);
    let projectOffset = getOffset(_PS_OFFSET);
    var _User = user[0];
    ghostUser.find({
      user: { $ne: userId },
      timezone: {$gte: (_User.timezone - timeOffset), $lte: (_User.timezone + timeOffset) },
    // project_size: {$gte: (_User.project_size - projectOffset),$lte: (_User.project_size + projectOffset)}
    }).sort({
      timezone: -1,
      skill_level: -1,
      project_size: -1
    }).exec((err, potentialCandidates) => {
      // Construct teampoary Team
      let _Team = { };
      _Team.manager = [];
      _Team.backend = [];
      _Team.frontend = [];
      // Decide users role
      let userRole = decideUserRole(_User);
      // Push user role to the team
      _Team[userRole].push(_User);
      // Get optimal skill leve
      let userSkillLevel = getUserSkillLevel(_User.skill_level);
      // Populate free roles in 5 man team
      var freeRoles = ['backend', 'backend', 'frontend', 'frontend', 'manager'];

      removeFromFreeRole(freeRoles, userRole);

      _Team.score = [_User.skill_level];

      potentialCandidates.forEach((potentailTeammate, arra, index) => {
        // Check if team is full
        var potentialRole = decideUserRole(potentailTeammate);
        // Check if role is free
        if (include(freeRoles, potentialRole)) {
          if (inRange(userSkillLevel, potentailTeammate.skill_level)) {
            _Team[potentialRole].push(potentailTeammate);
            removeFromFreeRole(freeRoles, potentialRole);
            _Team.score.push(potentailTeammate.skill_level);
          }
        }
      });

      if (freeRoles.length >= 0) {
        for (var i = 0; i < freeRoles.length; i++) {
          let potentailTeammate = find_Users_With_Any_Skill_Level_And_Same_Role(potentialCandidates, freeRoles[i])[0];
          _Team[freeRoles[i]].push(potentailTeammate);
          _Team.score.push(potentailTeammate.skill_level);
        }
      }
      _Team.getTeamSize = () => {
        return (_Team.backend.length + _Team.frontend.length + _Team.manager.length);
      };
      _Team.getScore = () => {
        function add (a, b) {
          return a + b;
        }
        return _Team.score.reduce(add, 0);
      };
      _Team.getTimezones = () => {
        let result = [];
        for (let i = 0; i < _Team.backend.length; i++) {
          result.push(_Team.backend[i].timezone);
        }
        for (let i = 0; i < _Team.frontend.length; i++) {
          result.push(_Team.frontend[i].timezone);
        }
        for (let i = 0; i < _Team.manager.length; i++) {
          result.push(_Team.manager[i].timezone);
        }
        return result;
      };
      format(_Team);
    });
  });
}

module.exports = (userId) => {
  return doSomething(userId);
};
