'use strict';

var server = require('../../dist/app.js');
var tokenUtils = require('../../dist/api/users/util.js');

var surveySchema = {
  role: ['frontend', 'backend', 'manager'],
  project_manager: true,
  skill_level: 3,
  project_size: 3,
  timezone: 0
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

describe('Survey Endpoints', function () {

  it("Can't get empty survey", (done) => {
    server.inject({
      method: 'GET',
      url: URL + '/survey',
      headers: {
        Authorization: 'bearer ' + token
      }
    }, function (res) {
      //Except not found
      expect(res.statusCode).to.be.equal(404);
      done();
    });
  });

  it("Post new survey", (done) => {
        server.inject({
          method: 'POST',
          url: URL + '/survey',
          headers: {
            Authorization: 'bearer ' + token
          },
          payload: {
            role: surveySchema.role,
            project_manager: surveySchema.project_manager,
            skill_level: surveySchema.skill_level,
            project_size: surveySchema.project_size,
            timezone: surveySchema.timezone
          }
        }, function (res) {
          //Except success code and exact survey
          let survey = res.result;
          expect(survey.role[2]).to.be.equal(surveySchema.role[2]);
          expect(survey.project_manager).to.be.equal(surveySchema.project_manager);
          expect(survey.skill_level).to.be.equal(surveySchema.skill_level);
          expect(survey.project_size).to.be.equal(surveySchema.project_size);
          expect(res.statusCode).to.be.equal(200);
          done();
      });
    });

  it('Gets users survey', (done) => {
      server.inject({
        method: 'GET',
        url: URL + '/survey',
        headers: {
          Authorization: 'bearer ' + token
        }
      }, function (res) {
          //Except success code and exact survey
        let survey = res.result;
        expect(survey.role[2]).to.be.equal(surveySchema.role[2]);
        expect(survey.project_manager).to.be.equal(surveySchema.project_manager);
        expect(survey.skill_level).to.be.equal(surveySchema.skill_level);
        expect(survey.project_size).to.be.equal(surveySchema.project_size);
        expect(res.statusCode).to.be.equal(200);
        expect(res.statusCode).to.be.equal(200);
        done();

    });
  });

  it("Update existing survey", (done) => {
        server.inject({
          method: 'POST',
          url: URL + '/survey',
          headers: {
            Authorization: 'bearer ' + token
          },
          payload: {
            role: ['manager'],
            project_manager: false,
            skill_level: 1,
            project_size: 1,
            timezone: 1
          }
        }, function (res) {
          //Except success code and exact survey
          let survey = res.result;
          expect(survey.role.length).to.not.equal(surveySchema.role.length);
          expect(survey.project_manager).to.not.equal(surveySchema.project_manager);
          expect(survey.skill_level).to.not.equal(surveySchema.skill_level);
          expect(survey.project_size).to.not.equal(surveySchema.project_size);
          expect(res.statusCode).to.be.equal(200);
          done();
      });
    });

});
