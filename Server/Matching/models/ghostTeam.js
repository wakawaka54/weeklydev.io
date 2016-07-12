'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamModel = new Schema({
  members: [{
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    role: String
  }],
  score: Number,
  confirmed: Number,
  manager: [Schema.Types.Mixed],
  frontend: [Schema.Types.Mixed],
  backend: [Schema.Types.Mixed]
});

module.exports = mongoose.model('ghostTeam', TeamModel, 'ghostTeams');
