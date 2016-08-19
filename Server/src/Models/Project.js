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
  },
  downvotes: {
    type: [Schema.Types.ObjectId],
    required: false
  }
});

//Arrow function instead of function() was giving me issues
ProjectModel.virtual('votes').get(function(){
  let up = this.upvotes == undefined ? 0 : this.upvotes.length;
  let down = this.downvotes == undefined ? 0 : this.downvotes.length;

  return up - down;
});

ProjectModel.statics.findProjectAndUpdate = function (pid, updateObject, cb) {
  return this.findOneAndUpdate({ _id: pid }, updateObject, cb);
};

ProjectModel.options.toObject = {
  transform: (doc, ret, opts) => {
    //Remove MongoDB __v (Version) property
    delete ret.__v;

    //Attach virtual method to return object
    ret.votes = doc.votes;
    return ret;
  }
};

export default mongoose.model('Project', ProjectModel, 'projects');
