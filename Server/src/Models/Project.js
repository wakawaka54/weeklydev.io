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
  deadline: {
    type: Date,
    required: false
  },
  created_on: {
    type: Date,
    default: Date.now()
  }
});

ProjectModel.options.toObject = {
  transform: (doc, ret, opts) => {
    delete ret.__v;
  }
};

export default mongoose.model('Project', ProjectModel, 'projects');
