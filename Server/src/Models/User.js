import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import SurveyModel from './Survey';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userId: String,
  email: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  requests: [{
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }],
  scope: [String],
  manager: [String],
  team: [{
    id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'Team'
    }
  }],
  project: [{
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Project'
  }],
  survey: SurveyModel,
  isSearching: {
    type: Boolean,
    default: true,
    required: true
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  token: {
    uuid: String,
    valid: Boolean
  },
  verified: {
    type: String,
    required: true,
    default: false
  },
  ghostTeams: [{
    type: Schema.Types.ObjectId,
    ref: 'ghostTeam'
  }]
});

UserSchema
  .path('password')
  .validate(function (password) {
    return password.length;
  }, 'Password cannot be blank');

var validatePresenceOf = function (value) {
  return value && value.length;
};

UserSchema
  .pre('save', function (next) {
    let hashPass = (cb) => {
      if (!validatePresenceOf(this.password)) {
        return cb(new Error('Invalid password'));
      }
      this.encryptPassword(this.password, (err, hash) => {
        if (err) {
          return cb(err);
        } else {
          this.password = hash;
          cb();
        }
      });
    };
    // handle duplicated ID
    if (this.isNew) {
      this.model('User').find({userId: this.userId}, (err, user) => {
        if (err || user[0]) {
          // TODO: generate a new ID
          return next(err || new Error('User Id already exists'));
        }else {
          hashPass(next);
        }
      });
    }else {
      // Handle new/update passwords
      if (!this.isModified('password')) {
        return next();
      }
      // hashPassword(this, next)
      hashPass(next);
    }
  });
UserSchema.statics.findByUserIdAndRemove = function (userId, cb) {
  return this.findOneAndRemove({ _id: userId}, cb);
};

UserSchema.statics.findByUserIdAndUpdate = function (userId, updateObject, cb) {
  return this.findOneAndUpdate({ _id: userId }, updateObject, cb);
};

UserSchema.statics.findByUserId = function (userId, cb) {
  return this.findOne({ _id: userId}, cb);
};

//Safe schema that doesn't allow the selection of password, etc. when populating other models with user
UserSchema.statics.safeUser = 'username';

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if (!callback) {
      return bcrypt.compareSync(password, this.password);
    }

    bcrypt.compare(password, this.password, (err, res) => {
      if (err) {
        return callback(err);
      } else {
        callback(null, res);
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Number} [rounds=10]
   * @param {Function} [cb]
   * @api public
   */
  encryptPassword: (pass, cb, rounds = 10) => {
    if (!cb) {
      return bcrypt.hashSync(pass, rounds);
    } else {
      return bcrypt.hash(pass, rounds, cb);
    }
  }
};

UserSchema.options.toObject = {
  transform: (doc, ret, opts) => {
    let user = {
      shortId: ret.userId,
      id: ret._id,
      username: ret.username,
      team: ret.team,
      // team: ret.team.map((t) => t.toObject()),
      project: ret.project,
      // project: ret.project.map((p) => p.toObject()),
      survey: ret.survey
    };

    if (!opts.scope) {
      return user;
    } else {
      let copy = (prop, realName) => {
        if (!realName) {
          realName = prop;
        }
        user[prop] = ret[realName];
      };

      switch (opts.scope) {
        case 'user':
          copy('ghostTeams');
        // user.ghostTeams = ret.ghostTeams.map((g) => g.toObject())
        case 'admin':
          user.id = ret._id.toString();
          copy('userId');
          copy('email');
          copy('access', 'scope');
          copy('isSearching');
          break;
        case 'users':
          user.id = ret._id.toString();
          copy('admin');
      }
      return user;
    }
  }
};

export default mongoose.model('User', UserSchema, 'users');
