import match from './match/match';
import schedule from 'node-schedule';
import GhostTeam from '../Models/GhostTeam.js';
import GhostUser from '../Models/GhostUser';

module.exports = () => {
  let j = schedule.scheduleJob('*/6 * * * *', function () {
    console.log('\n--> Started the job!');
    GhostTeam.find({}, (err, teams) => {
      if (err) {
        console.log('something went wrong');
        console.log(err);
        return;
      }
      console.log('--> Removing GhostTeam Database');
      teams.forEach((team, index, array) => {
        team.remove();
      });
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
