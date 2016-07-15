
import mongoose from 'mongoose'
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

const Survey = mongoose.model('Survey', SurveyModel, 'survey');
export default Survey
