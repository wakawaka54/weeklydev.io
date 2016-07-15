import mongoose from 'mongoose'
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

const Project = mongoose.model('Project', ProjectModel, 'projects')
export default Project
