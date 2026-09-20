const Joi = require('Joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  bio: Joi.string().max(300).allow(''),
})
  .min(1)
  .messages({
    'object.min': 'At least one field (name or bio) must be provided to update.',
  });

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};


