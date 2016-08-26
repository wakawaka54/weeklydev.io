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
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  requests: [{
    user: Schema.Types.ObjectId,
    role: String,
    msg: String
  }],
  created: {type: Date, default: Date.now()},
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
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
},
{
  toObject: { virtuals: true }
});

TeamModel
  .pre('save', function (next) {
    if (this.isNew) {
      // handle duplicated ID
      this.model('Team').findOne({name: this.name}, (err, team) => {
        if (err || team) {
          next(err || new Error('Team name already exists'));
        }else {
          next();
        }
      });
    }

    // populate members info about this team
    // TODO: add projects and submissions
    let updateObject = {};
    updateObject = { $addToSet: { team: this.id }};
    if(this.project) { updateObject.$addToSet['project'] = this.project; }
    this.members.forEach(user => {
      console.log('users to update:' + user);
      this.model('User').findByUserIdAndUpdate(user.user, updateObject).exec()
        .catch(err => next(err));
    });

    this.model('User').findByUserIdAndUpdate(this.manager, updateObject).exec();

    let updateProject = {}
    updateProject = { $addToSet: { team: this.id } };

    next();
  });

TeamModel
  .pre('remove', function (next) {
    let updateObject = {};
    updateObject = { $pull: { team: this.id }};
    if(this.project) { updateObject.$pull['project'] = this.project; }
    this.members.forEach(user => {
      this.model('User').findByUserIdAndUpdate(user.id, updateObject).exec()
        .catch(err => next(err))
    });

    next();
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
/*TeamModel.virtual('manager').get(() => {
  return getUsers(this.members, 'manager');
});*/

TeamModel.statics.findByTeamId = function (ID, cb) {
  return this.model('Team').findOne({ _id: ID }, cb);
};
TeamModel.statics.findByTeamIdAndRemove = function (ID, cb) {
  return this.model('Team').findOneAndRemove({ _id: ID }, cb);
};
TeamModel.options.toObject = {
  transform: (doc, ret, opts) => {
    delete ret.__v;

    return ret;
  }
};

export default mongoose.model('Team', TeamModel, 'teams');
