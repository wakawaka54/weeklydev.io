import match from './match';
import schedule from 'node-schedule';
import GhostTeam from '../Models/GhostTeam.js';
import User from '../Models/User';

export function startSchedule () {
  let j = schedule.scheduleJob('0 12 * * *', function () {
    console.log('\n--> Started the job!');
    runMatch();
  });
};

export function runMatch () {
  GhostTeam.find({}, (err, teams) => {
    if (err) {
      console.log(err);
    }else {
      teams.forEach(team => team.remove(err => ((err) ? console.log(err) : null)));
      User.find({ isSearching: true }, (err, users) => {
        if (err || !users) {
          console.log(err);
        }else {
          users.forEach(user => match(user));
        }
      });
    }
  });
};
