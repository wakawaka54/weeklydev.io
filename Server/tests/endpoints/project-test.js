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

var token;
var token2;
var user2;

before((done) => {
  token = users[0].token;
  token2 = users[1].token;
  user2 = users[1].user;
  done();
});

describe('Project Endpoints', function () {
  it('Create project', function (done) {
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
        Authorization: 'bearer ' + token2
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(409);
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
