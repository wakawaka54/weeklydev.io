import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const TeamModel = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Project',
    dafault: null
  },
  submission: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Submission',
    dafault: null
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
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
  }],
  requests: [{
    user: Schema.Types.ObjectId,
    role: String,
    msg: String
  }],
  meta: {
    created: {type: Date, default: Date.now()},
    disband: Date,
    members: [{
      id: Schema.Types.ObjectId,
      date: {
        joined: {type: Date, default: Date.now()},
        leave: Date
      }
    }]
  }
});

const Team = mongoose.model('Team', TeamModel, 'teams')
export default Team
