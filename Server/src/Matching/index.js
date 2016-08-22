import schedule from 'node-schedule';
import GhostTeam from '../Models/GhostTeam.js';
import User from '../Models/User';
import { startMatchmaking } from './algorithm';

export function startSchedule () {
  let j = schedule.scheduleJob('0 12 * * *', function () {
    console.log('\n--> Started the job!');
    runMatch();
  });
};

export function runMatch() {
  startMatchmaking();
}
