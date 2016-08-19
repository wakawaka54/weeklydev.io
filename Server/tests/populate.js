'use strict';

var mongoose = require('mongoose');
var User = require('../dist/Models/User.js');
var tokenUtils = require('../dist/api/users/util.js');
var shortid = require('shortid');

global.users = [];
global.projects = [];
global.teams = [];

var _exports = module.exports = {};

_exports.setup = function () {
  console.warn("Setting up test database");

  for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function () {});
  }

  addUsers();
  addProjects();
};

_exports.cleanup = function () {
  console.warn("Dropping test database");
  /*for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function() {});
  }*/
};

function addUsers() {
  var userss = {
    username: "testuser",
    password: "testuser",
    email: "test@test.com"
  };

  var UserModel = mongoose.model('User');

  for (var i = 0; i != 50; i++) {
    let user = new UserModel({
      userId: shortid.generate(),
      email: "test" + i + "@test.com",
      username: userss.username + i,
      scope: ['user'],
      password: userss.password,
      token: {
        uuid: tokenUtils.generateUUID(),
        valid: true
      }
    });

    user.save();

    users.push(user);
  }
}

function addProjects() {
  var project = {
    title: "test title",
    description: "test description",
    creator: users[0]._id
  };

  var ProjectModel = mongoose.model('Project');

  for (var i = 0; i != 50; i++) {
    var u = new ProjectModel();
    u.title = project.title + ' ' + i;
    u.description = project.description;
    u.creator = project.creator;

    u.save();

    projects.push(u);
  }
}

function addTeams() {
  var team = {
    name: "test team",
    isActive: true,
    manager: users[0].id
  };

  var TeamModel = mongoose.model('Team');

  for (var i = 0; i != 50; i++) {
    var u = new TeamModel();
    u.name = team.name + ' ' + i;
    u.isActive = team.isActive;
    u.manager = team.manager;

    u.save();

    teams.push(u);
  }
}
