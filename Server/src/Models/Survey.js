import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const SurveyModel = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  preferred_role: [{
    type: String,
    required: true
  }],
  project_manager: {
    type: Boolean,
    required: true
  },
  skill_level: {
    type: Number,
    required: true
  },
  project_size: {
    type: Number,
    required: true
  },
  timezone: {
    type: Number,
    required: true
  }
});

SurveyModel.statics.findByUserId = function (userId, cb) {
  return this.find({ user_id: userId}, cb);
};

SurveyModel.options.toObject = {
  transform: (doc, ret, opts) => {
    return {
      id: ret._id,
      user_id: ret.user_id,
      preferred_role: ret.preferred_role,
      project_manager: ret.project_manager,
      skill_level: ret.skill_level,
      project_size: ret.project_size,
      timezone: ret.timezone
    };
  }
};

export default mongoose.model('Survey', SurveyModel, 'survey');
