const express = require("express");
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  restoreNote,
  uploadNote,
} = require("./../controllers/noteController");
const { semanticSearch, ask } = require("./../controllers/searchController");
const validate = require("./../middlewares/validate");
const { uploadFile } = require("./../middlewares/uploadMiddleware");
const protect = require("./../middlewares/authMiddleware");
const {
  createNoteSchema,
  updateNoteSchema,
} = require("./../validations/noteValidation");
//importing the limiters
const {
  searchLimiter,
  aiUserLimiter,
  aiGlobalLimiter,
  uploadLimiter,
} = require("./../middlewares/rateLimiters");

//===========MIDDLEWARES=================
const router = express.Router();
router.use(protect);
//for deployment req.ip becomes the proxy's ip adress so every user shares 1 ip-based limit
//app.set('trust proxy', 1);
//============= END-POINTS ==============
router.post("/", validate(createNoteSchema), createNote);
router.post("/upload", uploadLimiter, uploadFile.single("file"), uploadNote);
router.get("/", getAllNotes);
router.get("/search/semantic", searchLimiter, semanticSearch);
router.get("/ask", aiUserLimiter, aiGlobalLimiter, ask);
router.get("/:id", getNoteById);
router.patch("/:id", validate(updateNoteSchema), updateNote);
router.patch("/:id/restore", restoreNote);
router.delete("/:id", deleteNote);

module.exports = router;
