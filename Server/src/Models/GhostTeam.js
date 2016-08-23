const async = require('async');

import User from './User.js';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const GhostTeamModel = new Schema({
  users: [{
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    role: String
  }],
  confirmed: Number,
});

GhostTeamModel.virtual('score').get(function () {
  let score = [];
  this.members.forEach((user, index, array) => {
    score.push(user.skill_level);
  });
  return score;
});

GhostTeamModel
  .pre('save', function (next) {

    //Add GhostTeam id to next user
    var ghostTeam = this;
    async.each(this.users, updateUserGhostTeam, (err) => { next(); });

    function updateUserGhostTeam(user, callback) {
      let update = {$push: {ghostTeams: ghostTeam.id}};
      User.findByIdAndUpdate(user.id, update, (err, user) => {
        if (err) {
          console.log(err);
          return next(err);
        }
        if (!user) {
          return next(new Error('User not found!'));
        }
        callback();
      });
    }
});

GhostTeamModel
  .pre('remove', function (next) {

    //Remove GhostTeam id from each User
    var ghostTeam = this;
    async.each(this.users, updateUserGhostTeam, (err) => { next(); });

    function updateUserGhostTeam(user, callback) {
      let update = {ghostTeams: [] };
      User.findByIdAndUpdate(user.id, update, (err, user) => {
        if (err) {
          console.log(err);
          return next(err);
        }
        if (!user) {
          return next(new Error('User not found!'));
        }
        callback();
      });
    }
  });

GhostTeamModel.options.toObject = {
  transform: (doc, ret, opts) => {
    delete ret.__v;
  }
};

export default mongoose.model('ghostTeam', GhostTeamModel, 'ghostTeams');
