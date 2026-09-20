const Joi = require('Joi');

const noteObjectSchema = Joi.object({
    title:Joi.string().trim().max(200).required(),
    content:Joi.string().trim().required(),
    tags:Joi.array().items(Joi.string().trim().max(50)).default([]).optional(),
    isPinned:Joi.boolean().default(false).optional(),
    isArchived:Joi.boolean().default(false).optional(),
    isDeleted:Joi.boolean().default(false).optional(),
    createdAt:Joi.date().default(Date.now()).optional(),
    updatedAt:Joi.date().default(Date.now()).optional(),
});
const createNoteSchema = Joi.alternatives().try(noteObjectSchema,
Joi.array().items(noteObjectSchema).min(1));

const updateNoteSchema = Joi.object({
  title: Joi.string().max(200),
  content: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  isPinned: Joi.boolean(),
  isArchived: Joi.boolean(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field (title, content, tags, isPinned, or isArchived) must be provided to update.',
  });

module.exports = {
    createNoteSchema,
    updateNoteSchema,
};


