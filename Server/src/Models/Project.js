import mongoose from 'mongoose';
const Schema = mongoose.Schema;

var ProjectModel = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    required: false
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  team: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Team'
  },
  deadline: {
    type: Date,
    required: false,
    default: Date.now()
  },
  created_on: {
    type: Date,
    default: Date.now()
  },
  public: {
    type: Boolean,
    required: false,
    default: false
  },
  upvotes: {
    type: [Schema.Types.ObjectId],
    required: false
  }
});

ProjectModel.options.toObject = {
  transform: (doc, ret, opts) => {
    delete ret.__v;

    return ret;
  }
};

export default mongoose.model('Project', ProjectModel, 'projects');
