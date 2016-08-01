import Joi from 'joi';

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(5).max(40).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export default userSchema;
