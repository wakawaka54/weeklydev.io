'use strict';

global.server = require('../dist/app.js');
global.chai = require('chai');
global.expect = global.chai.expect;

var populate = require('./populate.js');

// ----- Definition here
global.URL = 'http://localhost:1337/v1';

/*function generateRandomUser (cb) {
  var http = require('http');
  var NewUser;
  http.get('http://api.randomuser.me/?inc=login,email', (res) => {
    var user = res.body.results;
    NewUser.username = user.login.username;
    NewUser.password = user.login.password;
    NewUser.email = user.email;
    cb(NewUser);
  });
}*/
// chai.use(require('chai-http'))

before(function (done) {
  this.timeout(10000);
  populate.setup(done);
});

//require('./endpoints/server-test');
//require('./endpoints/user-test');
require('./endpoints/project-test.js');
require('./endpoints/team-tests.js');


after(function () {
  return populate.cleanup();
});
