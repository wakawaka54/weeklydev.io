'use strict'
const server = require('../../dist/app.js');
const user = {
  username: 'crazymouse55310',
  password: 'vectra',
  email: 'philip.barnes10@example.com'
};

const userSchema2 = {
  username: 'crazymouse55311',
  password: 'vectra',
  email: 'philip.barnes11@example.com'
};

var projectSchema = {
  id: "",
  title: "Test project",
  description: "Test description",
  tags: ["tag", "tag2", "tag3"],
  public: true
}

var teamSchema = {
  name: "Test Team",
  manager: "Test Manager",
  isActive: true,
  project: null
};

var user1 = { token: "", id: ""};
var user2 = { token: "", id: ""};

describe('Setup Project Tests', () => {
  it('Create new user 1', (done) => {
    server.inject({
      method: 'POST',
      url: URL + '/users/new',
      payload: {
        username: user.username,
        password: user.password,
        email: user.email
      }
    }, (result) => {
      user1.token = result.result.token;
      user1.id = result.result.user.id;
      expect(result.statusCode).to.equal(201);
      done();
    });
  });

  it('Create new user 2', (done) => {
    server.inject({
      method: 'POST',
      url: URL + '/users/new',
      payload: {
        username: userSchema2.username,
        password: userSchema2.password,
        email: userSchema2.email
      }
    }, (result) => {
      user2.token = result.result.token;
      user2.id = result.result.user.id;
      expect(result.statusCode).to.equal(201);
      done();
    });
  });
});

describe('Project Endpoints', () => {

  it('Create project', (done) => {
    server.inject({
      method: 'POST',
      url: URL + '/projects',
      headers: {
        Authorization: 'bearer ' + user1.token
      },
      payload: {
        title: projectSchema.title,
        description: projectSchema.description,
        tags: projectSchema.tags,
        public: projectSchema.public
      }
    }, (res) => {
      projectSchema.id = res.result.id;
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Get all projects', (done) => {
    server.inject({
      method: 'GET',
      url: URL + '/projects',
      headers: {
        Authorization: 'bearer ' + user1.token
      }
    }, (res) => {
      let proj = res.result.filter((project) => { return project._id == projectSchema.id});

      expect(proj.length).to.be.equal(1);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Get project', (done) => {
    server.inject({
      method: 'GET',
      url: URL + '/projects/' + projectSchema.id,
      headers: {
        Authorization: 'bearer ' + user1.token
      }
    }, (res) => {

      expect(res.result.id).to.be.equal(projectSchema.id);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Update project', (done) => {
    server.inject({
      method: 'PUT',
      url: URL + '/projects/' + projectSchema.id,
      headers: {
        Authorization: 'bearer ' + user1.token
      },
      payload: {
        title: "New"
      }
    }, (res) => {

      expect(res.result.title).to.be.equal("New");
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });
});

describe('Team Endpoints', () => {

  it('Create team', (done) => {
    server.inject({
      method: 'POST',
      url: URL + '/teams',
      headers: {
        Authorization: 'bearer ' + user1.token
      },
      payload: {
        name: teamSchema.name
      }
    }, (res) => {
      teamSchema.id = res.result.id;
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Get Teams', (done) => {
    server.inject({
      method: 'GET',
      url: URL + '/teams',
      headers: {
        Authorization: 'bearer ' + user1.token
      }
    }, (res) => {
      let team = res.result.filter((team) => team._id == teamSchema.id);
      expect(team.length).to.be.equal(1);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Get Team', (done) => {
    server.inject({
      method: 'GET',
      url: URL + '/teams/' + teamSchema.id,
      headers: {
        Authorization: 'bearer ' + user1.token
      }
    }, (res) => {
      expect(res.result.name).to.be.equal(teamSchema.name);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Update Team', (done) => {
    server.inject({
      method: 'PUT',
      url: URL + '/teams/' + teamSchema.id,
      headers: {
        Authorization: 'bearer ' + user1.token
      },
      payload: {
        isActive: false
      }
    }, (res) => {
      expect(res.result.isActive).to.be.equal(false);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Request Join Team', (done) => {
    server.inject({
      method: 'POST',
      url: URL + '/teams/' + teamSchema.id + "/join",
      headers: {
        Authorization: 'bearer ' + user2.token //User2 token
      },
      payload: {
        role: "frontend",
      	message: "I love this team"
      }
    }, (res) => {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Add User To Team', (done) => {
    server.inject({
      method: 'POST',
      url: URL + '/teams/' + teamSchema.id + "/add",
      headers: {
        Authorization: 'bearer ' + user1.token
      },
      payload: {
        id: user2.id,
        role: "backend"
      }
    }, (res) => {
      let team = res.result;
      expect(team.requests.length).to.be.equal(0);
      expect(team.members.length).to.be.equal(1);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Assign Project To Team', (done) => {
    server.inject({
      method: 'POST',
      url: `${URL}/teams/${teamSchema.id}/project/${projectSchema.id}`,
      headers: {
        Authorization: 'bearer ' + user1.token
      }
    }, (res) => {
      let team = res.result;
      expect(team.project == projectSchema.id);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Remove Project To Team', (done) => {
    server.inject({
      method: 'DELETE',
      url: `${URL}/teams/${teamSchema.id}/project/${projectSchema.id}`,
      headers: {
        Authorization: 'bearer ' + user1.token
      }
    }, (res) => {
      let team = res.result;
      expect(team.project).to.not.equal(projectSchema.id);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });
});

describe('Cleanup Project Tests', () => {

  it('Delete team', (done) => {
    server.inject({
      method: 'DELETE',
      url: URL + '/teams/' + teamSchema.id,
      headers: {
        Authorization: 'bearer ' + user1.token
      }
    }, (res) => {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });


  it('Delete projecct', (done) => {
    server.inject({
      method: 'DELETE',
      url: URL + '/projects/' + projectSchema.id,
      headers: {
        Authorization: 'bearer ' + user1.token
      }
    }, (res) => {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Delete user 1', (done) => {
    server.inject({
      method: 'DELETE',
      url: URL + '/users/' + user1.id,
      headers: {
        Authorization: 'bearer ' + user1.token
      }
    }, (res) => {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Delete user 2', (done) => {
    server.inject({
      method: 'DELETE',
      url: URL + '/users/' + user2.id,
      headers: {
        Authorization: 'bearer ' + user2.token
      }
    }, (res) => {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });
});
