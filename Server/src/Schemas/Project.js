import Joi from 'joi';

const projectSchema = Joi.object({
  title: Joi.string().min(3).max(72).required(),
  description: Joi.string().max(512).required(),
  manager: Joi.boolean(), //If true, then create a team with user as the manager
  tags: Joi.array().items(Joi.string()),
  deadline: Joi.date().min('now'),
  public: Joi.boolean()
});

const projectUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(72),
  description: Joi.string().max(512),
  manager: Joi.boolean(), //If true, then create a team with user as the manager
  tags: Joi.array().items(Joi.string()),
  deadline: Joi.date().min('now'),
  public: Joi.boolean()
});

export default projectSchema;
