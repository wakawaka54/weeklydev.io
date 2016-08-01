import Joi from 'joi';

const shortId = Joi.object({
  id: Joi.string().token().length(8)
});

export default shortId;
