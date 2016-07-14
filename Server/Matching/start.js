'use strict';

const match = require('./match/match');
const schedule = require('node-schedule');
const GhostTeam = require('./models/ghostTeam');
const GhostUser = require('./models/searchingUsers');

module.exports = () => {
  let j = schedule.scheduleJob('*/2 * * * *', function () {
    console.log('\n--> Started the job!');
    GhostTeam.remove({}, (err, teams) => {
      console.log('--> Removing GhostTeam Database');
      if (err || teams.length > 0) {
        console.log('something went wrong');
        console.log(err);
        return;
      }
      GhostUser.find({}, (err, users) => {
        console.log('--> Passing users to matchmaking functions');
        if (err || !users) {
          console.log('No users to Match');
          console.log(err);
          console.log(users);
        }
        users.forEach((user, index, array) => {
          match(user.userId);
        });
      });
    });
  });
};
