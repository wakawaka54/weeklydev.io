import Joi from 'joi';

export const teamSchema = Joi.object({
	name: Joi.string().required(),
	users: Joi.array().items(Joi.object().keys({
		id: Joi.string().regex(/^[0-9a-zA-Z_\-]{7,14}$/),
		role: Joi.string().allow(['frontend', 'backend', 'manager'])
	})).max(5)
});

export const teamProjectSchema = Joi.object({
	project: Joi.string()
});