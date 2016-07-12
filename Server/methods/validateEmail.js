'use strict';

const Joi = require('joi');
const schema = { email: Joi.string().email({minDomainAtoms: 2}) };

module.exports = (email) => {
  return ((Joi.validate({email: email}, schema).error === null) ? true : false);
};
