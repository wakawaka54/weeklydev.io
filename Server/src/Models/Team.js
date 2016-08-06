import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TeamModel = new Schema({
  teamId: String,
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
  isActive: {
    type: Boolean,
    default: false
  },
  members: [{
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    role: String
  }],
  requests: [{
    id: Schema.Types.ObjectId,
    role: String,
    msg: String
  }],
  meta: {
    Match: Boolean,
    timezone: [Number],
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

TeamModel
  .pre('save', function (next) {
    if (this.isNew) {
      // handle duplicated ID
      this.model('Team').findOne({teamId: this.teamId}, (err, user) => {
        if (err || user) {
          next(err || new Error('User Id already exists'));
        }else {
          next();
        }
      });
    }
    // populate members info abou this team
    // TODO: add projects and submissions
    let _count = this.members.length;
    let _current = 0;
    let updateObject = {};
    updateObject = { $addToSet: { team: this.teamId }};
    if (this.project) updateObject['$addToSet'].project = this.project;
    if (this.submission)  updateObject['$addToSet'].submission = this.submission;
    this.members.forEach(user => {
      this.model('User').findByUserIdAndUpdate(user.id, updateObject).exec()
        .catch(err => next(err))
        .then(user => {
          _current++;
          if (_current == _content) {
            next();
          }
        });
    });
  });

TeamModel
  .pre('remove', function (next) {
    let _count = this.members.length;
    let _current = 0;
    let updateObject = {};
    updateObject = { $pull: { team: this.teamId }};
    if (this.project) updateObject['$addToSet'].project = this.project;
    if (this.submission)  updateObject['$addToSet'].submission = this.submission;
    this.members.forEach(user => {
      this.model('User').findByUserIdAndUpdate(user.id, updateObject).exec()
        .catch(err => next(err))
        .then(user => {
          _current++;
          if (_current == _content) {
            next();
          }
        });
    });
  });

let getUsers = (users, role) => {
  let ret;
  users.forEach(user => {
    if (user.role === role) ret += user;
  });
  return ret;
};

TeamModel.virtual('frontend').get(() => {
  return getUsers(this.members, 'frontend');
});
TeamModel.virtual('backend').get(() => {
  return getUsers(this.members, 'backend');
});
TeamModel.virtual('manager').get(() => {
  return getUsers(this.members, 'manager');
});

TeamModel.statics.findByTeamId = (ID, cb) => {
  return this.findOne({teamId: ID}, cb);
};
TeamModel.statics.findByTeamIdAndRemove = (ID, cb) => {
  return this.findOneAndRemove({teamId: ID}, cb);
};
TeamModel.options.toObject = {
  transform: (doc, ret, opts) => {
    delete ret.__v;

    return ret;
  }
};

export default mongoose.model('Team', TeamModel, 'teams');
