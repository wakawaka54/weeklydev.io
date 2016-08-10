import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TeamModel = new Schema({
  name: String,
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String
  }],
  project: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Project',
    dafault: null
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requests: [{
    id: Schema.Types.ObjectId,
    role: String,
    msg: String
  }],
  created: {type: Date, default: Date.now()},
  meta: {
    Match: Boolean,
    timezone: [Number],
    disband: Date,
    members: [{
      id: String,
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
      this.model('Team').findOne({name: this.name, (err, team) => {
        if (err || team) {
          next(err || new Error('Team name already exists'));
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
    updateObject = { $addToSet: { team: {id: this.id, shortId: this.teamId}  }};
    if (this.project) updateObject['$addToSet'].project = this.project;
    if (this.submission)  updateObject['$addToSet'].submission = this.submission;
    this.members.forEach(user => {
      this.model('User').findByUserIdAndUpdate(user.id, updateObject).exec()
        .catch(err => next(err))
        .then(user => {
          _current++;
          if (_current == _count) {
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
    updateObject = { $pull: { team: {id: this.id, shortId: this.teamId} }};
    if (this.project) updateObject['$addToSet'].project = this.project;
    if (this.submission)  updateObject['$addToSet'].submission = this.submission;
    this.members.forEach(user => {
      this.model('User').findByUserIdAndUpdate(user.id, updateObject).exec()
        .catch(err => next(err))
        .then(user => {
          _current++;
          if (_current == _count) {
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

TeamModel.virtual('Members', {
  ref: 'User', // The model to use
  localField: 'members.id', // Find people where `localField`
  foreignField: 'userId' // is equal to `foreignField`
});
TeamModel.virtual('frontend').get(() => {
  return getUsers(this.members, 'frontend');
});
TeamModel.virtual('backend').get(() => {
  return getUsers(this.members, 'backend');
});
/*TeamModel.virtual('manager').get(() => {
  return getUsers(this.members, 'manager');
});*/

TeamModel.statics.findByTeamId = function (ID, cb) {
  return this.model('Team').findOne({teamId: ID}, cb);
};
TeamModel.statics.findByTeamIdAndRemove = function (ID, cb) {
  return this.model('Team').findOneAndRemove({teamId: ID}, cb);
};
TeamModel.options.toObject = {
  transform: (doc, ret, opts) => {
    delete ret.__v;

    return ret;
  }
};

export default mongoose.model('Team', TeamModel, 'teams');
