import Joi from 'joi';

const teamSchema = Joi.object({
  user: Joi.array().items(Joi.object().keys({
    id: Joi.string().regex(/^[0-9a-zA-Z_\-]{7,14}$/),
    role: Joi.string().allow(['frontend', 'backend', 'manager'])
  })).max(5)
});

export default teamSchema;
