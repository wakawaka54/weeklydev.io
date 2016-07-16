import Joi from 'joi';
import { urlRegEx } from '../api/submissions/util.js';

const submissionSchema = Joi.object({
  team: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  project: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  repo_url: Joi.string().regex(urlRegEx(['github', 'bitbucket', 'gitlab'], ['com', 'org'])),
  // TODO: add url regex
  images: Joi.string(),
  thumbnail: Joi.string(),
  date: Joi.date().min('now')
});

export default submissionSchema;
