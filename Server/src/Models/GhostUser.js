import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const searchingUsers = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  preferred_role: [String],
  project_manager: Boolean,
  skill_level: Number,
  project_size: Number,
  timezone: Number
});

export default mongoose.model('searchingUser', searchingUsers, 'searchingUsers');
