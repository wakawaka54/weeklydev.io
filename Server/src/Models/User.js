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
  scope: [String],
  manager: [String],
  team: [{
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Team'
  }],
  project: [{
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Project'
  }],
  // survey: {
  //   type: Schema.Types.ObjectId,
  //   required: false,
  //   ref: 'Survey'
  // },
  survey: SurveyModel,
  isSearching: {
    type: Boolean,
    default: false,
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
  salt: String,
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
    function hashPassword (that , _next) {
      if (!validatePresenceOf(that.password)) {
        return _next(new Error('Invalid password'));
      }

      // Make salt with a callback
      that.makeSalt((saltErr, salt) => {
        if (saltErr) {
          return _next(saltErr);
        }
        that.salt = salt;
        that.encryptPassword(that.password, (encryptErr, hashedPassword) => {
          if (encryptErr) {
            return _next(encryptErr);
          }
          that.password = hashedPassword;
          _next();
        });
      });
    }
    // handle duplicated ID
    if (this.isNew) {
      this.model('User').find({userId: this.userId}, (err, user) => {
        if (err || user[0]) {
          return next(err || new Error('User Id already exists'));
        }else {
          if (!this.survey) {
            this.survey = {
              role: [],
              project_manager: false,
              skill_level: 0,
              project_size: 5,
              timezone: 0
            };
          }
          hashPassword(this, next);
        }
      });
    }else {
      // Handle new/update passwords
      if (!this.isModified('password')) {
        return next();
      }
      hashPassword(this, next);
    }
  });
UserSchema.statics.findByUserIdAndRemove = function (userId, cb) {
  return this.findOneAndRemove({ userId: userId},cb);
};

UserSchema.statics.findByUserIdAndUpdate = function (userId, updateObject, cb) {
  return this.findOneAndUpdate({ userId: userId }, updateObject, cb);
};

UserSchema.statics.findByUserId = function (userId, cb) {
  return this.findOne({ userId: userId}, cb);
};

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
   * Make salt
   *
   * @param {Number} byteSize Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(rounds, callback) {
    var defaultRounds = 10;
    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
      rounds = defaultRounds;
    } else if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    }

    if (!rounds) {
      rounds = defaultRounds;
    }

    if (!callback) {
      return bcrypt.genSaltSync(rounds);
    }

    return bcrypt.genSalt(rounds, (err, salt) => {
      if (err) {
        callback(err);
      } else {
        callback(null, salt);
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if (!password || !this.salt) {
      return null;
    }

    var salt = this.salt;

    if (!callback) {
      return bcrypt.hashSync(password, salt).toString('base64');
    }

    return bcrypt.hash(password, salt, (err, key) => {
      if (err) {
        callback(err);
      } else {
        callback(null, key.toString('base64'));
      }
    });
  }
};

UserSchema.options.toObject = {
  transform: (doc, ret, opts) => {
    let user = {
      id: ret.userId,
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
          // user.ghostTeams = ret.ghostTeams.map((g) => g.toObject());
        case 'admin':
          user.id = ret._id.toString();
          copy('userId');
          copy('email');
          copy('access', 'scope');
          copy('isSearching');
          break;
        case 'users':
          copy('admin');
      }
      return user;
    }
  }
};

export default mongoose.model('User', UserSchema, 'users');
