import Boom from 'boom'
import Submission from '../../Models/Submission.js'

/*
 * Add a submission
 */
export function addSubmission(req, res){
  let submission = new Submission();
  let p = req.payload;
  submission.project = p.project;
  submission.team = p.team;
  submission.repo_url = p.repo_url;
  if (p.thumbnail) {
    submission.thumbnail = p.thumbnail;
  }
  if (p.images) {
    submission.images = p.images;
  }
  if (p.date) {
    submission.date.due = p.date;
  }

  submission.save((err, submission) => {
    if (err) {
      res(Boom.badRequest(err));
    }
    res(submission);
  });

}

/*
 * Get Submissions
 */
export function getSubmissions(req, res){
  Submission.find((err, submissions) => {
    if (err) {
      res(Boom.badRequest(err));
    }
    res(submissions);
  });
}


/*
 * Delete Submissions
 */
export function deleteSubmissions(req, res){
  Submission.findByIdAndDelete(req.params.id, (err, submissions) => {
    if (err) {
      res(Boom.badRequest(err));
    }
    res(submissions);
  });
}


/*
 * Update Submissions
 */
export function updateSubmissions(req, res){
  let p = req.payload;
  function update () {
    // TODO: for the love of all holy make this something nicer
    let response = { };
    if (p.project) {
      response.project = p.project;
    }
    if (p.team) {
      response.team = p.team;
    }
    if (p.repo_url) {
      response.repo_url = p.team;
    }
    if (p.thumbnail) {
      response.thumbnail = p.thumbnail;
    }
    if (p.date) {
      response.date.due = p.date;
    }
    return response;
  }
  // TODO: instead of using a function try passing in req.params it self
  Submission.findByIdAndUpdate(req.params.id, update(), (err, submissions) => {
    if (err) {
      res(Boom.badRequest(err));
    }
    res(submissions);
  });
}
