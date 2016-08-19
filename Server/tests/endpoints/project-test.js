'use strict';

var server = require('../../dist/app.js');
var tokenUtils = require('../../dist/api/users/util.js');

var projectSchema = {
  id: "",
  title: "Test project",
  description: "Test description",
  tags: ["tag", "tag2", "tag3"],
  public: true
};

var teamSchema = {
  name: "Test Team",
  manager: "Test Manager",
  isActive: true,
  project: null
};

var user = { token: "", id: "" };
var token;
var token2;

before(() => {
  console.log(user[0]);
  token = tokenUtils.createToken(users[0]);
  token2 = tokenUtils.createToken(users[1]);
});

describe('Project Endpoints', function () {
  it('Create project', function (done) {
    console.log(token);
    server.inject({
      method: 'POST',
      url: URL + '/projects',
      headers: {
        Authorization: 'bearer ' + token
      },
      payload: {
        title: projectSchema.title,
        description: projectSchema.description,
        tags: projectSchema.tags,
        public: projectSchema.public
      }
    }, function (res) {
      projectSchema.id = res.result.id;
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Get all projects', function (done) {
    server.inject({
      method: 'GET',
      url: URL + '/projects',
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {
      var proj = res.result.filter(function (project) {
        return project._id == projectSchema.id;
      });

      expect(proj.length).to.be.equal(1);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Get project', function (done) {
    server.inject({
      method: 'GET',
      url: URL + '/projects/' + projectSchema.id,
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {

      expect(res.result.id).to.be.equal(projectSchema.id);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Update project', function (done) {
    server.inject({
      method: 'PUT',
      url: URL + '/projects/' + projectSchema.id,
      headers: {
        Authorization: 'bearer ' + token
      },
      payload: {
        title: "New"
      }
    }, function (res) {

      expect(res.result.title).to.be.equal("New");
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Upvote project', function (done) {
    server.inject({
      method: 'POST',
      url: URL + '/projects/' + projectSchema.id + '/upvote',
      headers: {
        Authorization: 'bearer ' + token2
      }
    }, function (res) {
      var project = res.result;
      expect(project.upvotes.indexOf(user2.id)).to.not.equal(-1);
      expect(project.downvotes.indexOf(user2.id)).to.be.equal(-1);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Cannot upvote project again', function (done) {
    server.inject({
      method: 'POST',
      url: URL + '/projects/' + projectSchema.id + '/upvote',
      headers: {
        Authorization: 'bearer ' + token2
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(409);
      done();
    });
  });

  it('Downvote project', function (done) {
    server.inject({
      method: 'POST',
      url: URL + '/projects/' + projectSchema.id + '/downvote',
      headers: {
        Authorization: 'bearer ' +  token2
      }
    }, function (res) {
      var project = res.result;
      expect(project.upvotes.indexOf(user2.id)).to.be.equal(-1);
      expect(project.downvotes.indexOf(user2.id)).to.not.equal(-1);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Cannot downvote project again', function (done) {
    server.inject({
      method: 'POST',
      url: URL + '/projects/' + projectSchema.id + '/downvote',
      headers: {
        Authorization: 'bearer ' + user2.token
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(409);
      done();
    });
  });
});

describe('Team Endpoints', function () {

  it('Create team', function (done) {
    server.inject({
      method: 'POST',
      url: URL + '/teams',
      headers: {
        Authorization: 'bearer ' + token
      },
      payload: {
        name: teamSchema.name
      }
    }, function (res) {
      teamSchema.id = res.result.id;
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Get Teams', function (done) {
    server.inject({
      method: 'GET',
      url: URL + '/teams?page=0',
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {
      var team = res.result.filter(function (team) {
        return team._id == teamSchema.id;
      });
      expect(team.length).to.be.equal(1);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Get Team', function (done) {
    server.inject({
      method: 'GET',
      url: URL + '/teams/' + teamSchema.id,
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {
      expect(res.result.name).to.be.equal(teamSchema.name);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Update Team', function (done) {
    server.inject({
      method: 'PUT',
      url: URL + '/teams/' + teamSchema.id,
      headers: {
        Authorization: 'bearer ' + token
      },
      payload: {
        isActive: false
      }
    }, function (res) {
      expect(res.result.isActive).to.be.equal(false);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Request Join Team', function (done) {
    server.inject({
      method: 'POST',
      url: URL + '/teams/' + teamSchema.id + "/join",
      headers: {
        Authorization: 'bearer ' + token2 //User2 token
      },
      payload: {
        role: "frontend",
        message: "I love this team"
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Add User To Team', function (done) {
    server.inject({
      method: 'POST',
      url: URL + '/teams/' + teamSchema.id + "/add",
      headers: {
        Authorization: 'bearer ' + token
      },
      payload: {
        id: user2.id,
        role: "backend"
      }
    }, function (res) {
      var team = res.result;
      expect(team.requests.length).to.be.equal(0);
      expect(team.members.length).to.be.equal(1);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Assign Project To Team', function (done) {
    server.inject({
      method: 'POST',
      url: URL + '/teams/' + teamSchema.id + '/project/' + projectSchema.id,
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {
      var team = res.result;
      expect(team.project == projectSchema.id);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Remove Project To Team', function (done) {
    server.inject({
      method: 'DELETE',
      url: URL + '/teams/' + teamSchema.id + '/project/' + projectSchema.id,
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {
      var team = res.result;
      expect(team.project).to.not.equal(projectSchema.id);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });
});

describe('Cleanup Project Tests', function () {

  it('Delete team', function (done) {
    server.inject({
      method: 'DELETE',
      url: URL + '/teams/' + teamSchema.id,
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Delete projecct', function (done) {
    server.inject({
      method: 'DELETE',
      url: URL + '/projects/' + projectSchema.id,
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });
});
