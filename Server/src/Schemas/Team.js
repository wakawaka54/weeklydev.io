import Joi from 'joi';

export const newTeamSchema = Joi.object({
	name: Joi.string().required(),
	/*users: Joi.array().items(Joi.object().keys({
		id: Joi.string().regex(/^[0-9a-zA-Z_\-]{7,14}$/),
		role: Joi.string().allow(['frontend', 'backend', 'manager'])
	})).max(5)*/
});

export const updateTeamSchema = Joi.object({
	manager: Joi.string(),
	isActive: Joi.boolean()
});

export const addProjectTeamSchema = Joi.object({
	project: Joi.string()
});

export const addUserTeamSchema = Joi.object({
  id: Joi.string().token().required(),
  role: Joi.string().allow(['frontend', 'backend', 'manager']).required()
});

export const joinTeamSchema = Joi.object({
	role: Joi.string().allow(['frontend', 'backend', 'manager']).required(),
	message: Joi.string()
});
