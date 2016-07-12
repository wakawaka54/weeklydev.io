'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const searchingUsers = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  preferred_role: [String],
  project_manager: Boolean,
  skill_level: Number,
  project_size: Number,
  timezone: Number,
  ghostTeams: [{
    type: Schema.Types.ObjectId,
    ref: 'ghostTeam'
  }]
});

module.exports = mongoose.model('searchingUser', searchingUsers, 'searchingUsers');
