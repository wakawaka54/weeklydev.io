'use strict';

const Joi = require('joi');

const teamSchema = Joi.object({
  role: Joi.array().items(Joi.object().keys({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    role: Joi.string().allow(['frontend', 'backend', 'manager'])
  })).max(5)
});

module.exports = teamSchema;
