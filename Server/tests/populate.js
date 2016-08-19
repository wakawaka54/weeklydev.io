'use strict';

var server = require('../dist/app.js');
var mongoose = require('mongoose');
var User = require('../dist/Models/User.js');
var tokenUtils = require('../dist/api/users/util.js');
var shortid = require('shortid');

global.users = [];
global.projects = [];
global.teams = [];

var _exports = module.exports = {};

_exports.setup = function(done) {
  console.warn("Setting up test database");

  for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function () {});
  }

addUsers(() => {
  addProjects(() => {
    addTeams(() => {
      done();
    });
  });
});

};

_exports.cleanup = function () {
  console.warn("Dropping test database");
  /*for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function() {});
  }*/
};

function addUsers(done) {
  var user = {
    username: "testuser",
    password: "testuser",
    email: "test@test.com"
  };

  var i = 0;

  function addUser(i, cb) {
    server.inject({
      method: 'POST',
      url: URL + '/users/new',
      payload: {
        username: user.username + i,
        password: user.password,
        email: `test${i}@test.com`
      }
    }, function (result) {
      let user = result.result;
      users.push(user);
      cb(done);
    });
  }

  function iterate(done)
  {
    if(i != 20)
    {
      addUser(i++, iterate);
    }
    else { done(); }
  }

  iterate(done);
}

function addProjects(done) {
    var project = {
      title: "test title",
      description: "test description"
    };

    var i = 0;

    function iterate(done)
    {
      if(i++ != 10)
      {
          server.inject({
            method: 'POST',
            url: URL + '/projects',
            headers: {
              Authorization: 'bearer ' + users[0].token
            },
            payload: {
              title: project.title + i,
              description: project.description + i,
              tags: ["test", "description"],
              public: true
            }
          }, function (res) {
            let project = res.result;
            projects.push(project);
            iterate(done);
          });
      }
      else { done(); }
  }

  iterate(done);
}

function addTeams(done) {
  var team = {
    name: "test team",
    isActive: true,
    manager: users[0].id
  };

  var i = 0;

  function iterate(done)
  {
    if(i++ != 25)
    {
      server.inject({
        method: 'POST',
        url: URL + '/teams',
        headers: {
          Authorization: 'bearer ' + users[0].token
        },
        payload: {
          name: team.name + i
        }
      }, function (res) {
        let team = res.result;
        teams.push(team);
        iterate(done);
      });
    }
    else { done(); }
  }

  iterate(done);
}
