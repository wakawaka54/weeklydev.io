'use strict';

var server = require('../../dist/app.js');
var user = {
  username: 'crazymouse553',
  password: 'vectra',
  email: 'philip.barnes@example.com'
};

describe('Creating new user', function () {
  it('POST new user data', function (done) {
    server.inject({
      method: 'POST',
      url: URL + '/users/new',
      payload: {
        username: user.username,
        password: user.password,
        email: user.email
      }
    }, function (result) {
      res = result.result;
      expect(result.statusCode).to.equal(201);
      done();
    });
  });

  it('Response matches with user data', function () {
    expect(res.user.username).to.equal(user.username);
    expect(res.user.email).to.equal(user.email);
  });

  it('Respond with ID', function () {
    expect(res.user.id).to.be.a('string');
    expect(res.user).to.include.keys('id');
  });
  it('Respond with Token', function () {
    expect(res.token).to.be.a('string');
    expect(res).to.include.keys('token');
  });

  it('User is not admin', function () {
    // expect(res.user.admin).to.be.false
  });

  it('User is not in team', function () {
    expect(res.user.team).to.be.a('array');
    expect(res.user.team).to.have.length.below(1);
  });

  it('User does not have any projects', function () {
    expect(res.user.project).to.be.a('array');
    expect(res.user.project).to.have.length.below(1);
  });
});

describe('Login ', function () {
  it('user with username', function (done) {
    server.inject({
      method: 'POST',
      url: '/v1/login',
      headers: {
        Authorization: 'Basic ' + new Buffer(user.username + ':' + user.password, 'utf8').toString('base64')
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('user with email', function (done) {
    server.inject({
      method: 'POST',
      url: '/v1/login',
      headers: {
        Authorization: 'Basic ' + new Buffer(user.email + ':' + user.password, 'utf8').toString('base64')
      }
    }, function (res) {
      loginRes = res.result;
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('user with wrong username', function (done) {
    server.inject({
      method: 'POST',
      url: '/v1/login',
      headers: {
        Authorization: 'Basic ' + new Buffer('Invalid' + ':' + user.password, 'utf8').toString('base64')
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(401);
      done();
    });
  });

  it('user with wrong email', function (done) {
    server.inject({
      method: 'POST',
      url: '/v1/login',
      headers: {
        Authorization: 'Basic ' + new Buffer('invalid@someRussina.email' + ':' + user.password, 'utf8').toString('base64')
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(401);
      done();
    });
  });

  it('user with wrong password ( username )', function (done) {
    server.inject({
      method: 'POST',
      url: '/v1/login',
      headers: {
        Authorization: 'Basic ' + new Buffer(user.username + ':' + '123456ShittyPassword', 'utf8').toString('base64')
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(401);
      done();
    });
  });

  it('user with wrong password ( email )', function (done) {
    server.inject({
      method: 'POST',
      url: '/v1/login',
      headers: {
        Authorization: 'Basic ' + new Buffer(user.email + ':' + '123456ShittyPassword', 'utf8').toString('base64')
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(401);
      done();
    });
  });
});

describe('Deleting user :', function () {

  var deleteRes = void 0;

  it('Respond with succes', function (done) {
    server.inject({
      method: 'DELETE',
      url: '/v1/users/' + res.user.userId,
      headers: {
        Authorization: 'bearer ' + loginRes.token
      }
    }, function (res) {
      deleteRes = res.result;
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('Respond with ID', function () {
    expect(deleteRes.id).to.be.a('string');
    expect(deleteRes).to.include.keys('id');
  });

  it('Respond with Username and Email', function () {
    expect(deleteRes.username).to.be.a('string');
    expect(deleteRes.username).to.be.equal(user.username);
    expect(deleteRes.email).to.be.a('string');
    expect(deleteRes.email).to.be.equal(user.email);
  });

  it('Login after deleted with username', function (done) {
    server.inject({
      method: 'POST',
      url: '/v1/login',
      headers: {
        Authorization: 'Basic ' + new Buffer(user.username + ':' + user.password, 'utf8').toString('base64')
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(401);
      expect(res.result.error).to.be.equal('Unauthorized');
      expect(res.result.message).to.be.equal('Bad username or password');
      done();
    });
  });

  it('Login after deleted with email', function (done) {
    server.inject({
      method: 'POST',
      url: '/v1/login',
      headers: {
        Authorization: 'Basic ' + new Buffer(user.email + ':' + user.password, 'utf8').toString('base64')
      }
    }, function (res) {
      expect(res.statusCode).to.be.equal(401);
      expect(res.result.error).to.be.equal('Unauthorized');
      expect(res.result.message).to.be.equal('Bad username or password');
      done();
    });
  });
});
