import Joi from 'joi';

const surveySchema = Joi.object({
  role: Joi.array().items(Joi.string().allow(['frontend', 'backend', 'manager'])).min(1).max(3).required(),
  project_manager: Joi.boolean().required(),
  skill_level: Joi.number().min(1).max(5).required(),
  project_size: Joi.number().min(1).max(5).required(),
  timezone: Joi.number().min(-12).max(12).required()
});

export default surveySchema;
