
var teamSchema = {
  name: "Test Team",
  manager: "Test Manager",
  isActive: true,
  project: null
};

var token;
var token2;
var user2;
var projectSchema;

before((done) => {
  token = users[0].token;
  token2 = users[1].token;
  user2 = users[1].user;
  projectSchema = projects[1];
  done();
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
      var teams = res.result;
      expect(teams.length).to.be.equal(20);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Get Teams - Page Query', function (done) {
    server.inject({
      method: 'GET',
      url: URL + '/teams?page=1',
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {
      var teams = res.result;
      expect(teams.length).to.not.equal(20);
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
});
