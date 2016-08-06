import Joi from 'joi';

const shortId = Joi.object({
  id: Joi.string().regex(/^[0-9a-zA-Z_\-]{7,14}$/)
});

export default shortId;
