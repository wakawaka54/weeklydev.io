import Joi from 'joi';

const userSchema = Joi.object({
  email: Joi.string().email().allow('').description('Your Email Address').example('email@exmaple.com'),
  passOld: Joi.string().min(6).allow('').description('Your Old Password').example('password123'),
  passNew: Joi.alternatives().when('passOld', {
    is: Joi.string().min(6),
    then: Joi.string().min(6).allow('').required()
  }).description('Your New Password').example('correctHorseBatteryStample')
});
export default userSchema;
