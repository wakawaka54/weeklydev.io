'use strict';

var assert = require('chai').assert;
var expect = require('chai').expect;
var server = require('../app.js');

describe('Tests api functionality', function () {
  describe('/', function () {
    it('Should respond with a 200 OK', function (done) {
      server.inject({
        method: 'GET',
        url: '/'
      }, function (res) {
        expect(res.statusCode).to.equal(200);
      });
      done();
    });
  });
});