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
    title:Joi.string().trim().max(200),
    content:Joi.string().trim(),
    tags:Joi.array().items(Joi.string().trim().max(50)),
    isPinned:Joi.boolean(),
    isArchived:Joi.boolean(),
    isDeleted:Joi.boolean(),
    updatedAt:Joi.date().default(Date.now()).optional(),
}).min(1);

module.exports = {
    createNoteSchema,
    updateNoteSchema,
};


