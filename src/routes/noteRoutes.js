const express = require('express');
const {createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote,
restoreNote} = require('../controllers/noteController');
//routes-->[Joi validation middlewares]-->controllers-->services--->models
const validate = require('../middlewares/validate');
const {createNoteSchema, updateNoteSchema} = require('../validations/noteValidation');

const router = express.Router();

router.post('/', validate(createNoteSchema), createNote);
router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.patch('/:id', validate(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/restore', restoreNote)

module.exports = router;
