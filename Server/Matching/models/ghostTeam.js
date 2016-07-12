'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamModel = new Schema({
  manager: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }],
  frontend: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }],
  backend: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }]
});

module.exports = mongoose.model('ghostTeam', TeamModel, 'ghostTeams');
