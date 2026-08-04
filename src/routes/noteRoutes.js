const express = require('express');
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  restoreNote,
} = require('./../controllers/noteController');
const { semanticSearch } = require('./../controllers/searchController');
const validate = require('./../middlewares/validate');
const protect = require('./../middlewares/authMiddleware');
const { createNoteSchema, updateNoteSchema } = require('./../validations/noteValidation');

const router = express.Router();

router.use(protect);

router.post('/', validate(createNoteSchema), createNote);
router.get('/', getAllNotes);
router.get('/search/semantic', semanticSearch);
router.get('/:id', getNoteById);
router.patch('/:id', validate(updateNoteSchema), updateNote);
router.patch('/:id/restore', restoreNote);
router.delete('/:id', deleteNote);

module.exports = router;
