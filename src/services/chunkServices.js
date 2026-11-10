const Chunk = require("./../models/Chunk");
const chunkText = require("./../utils/chunkUtils");
const embeddingService = require("./embeddingservice");
const logger = require("./../config/logger");
const Note = require("../models/Note");

const createChunksForNote = async (note) => {
  const version = note.contentVersion ?? 0;
  const pieces = chunkText(note.content);

  // Phase 1: build. Slow work only, no database changes.
  const chunkDocs = [];
  for (let index = 0; index < pieces.length; index += 1) {
    const piece = pieces[index];
    const embedding = await embeddingService.generateEmbedding(piece.text);

    chunkDocs.push({
      noteId: note._id,
      userId: note.userId,
      isDeleted: note.isDeleted,
      contentVersion: version,
      chunkIndex: index,
      text: piece.text,
      tokenCount: piece.tokenCount,
      embedding,
    });
  }

  // Phase 2: swap. Fast database operations only.
  await Chunk.deleteMany({ noteId: note._id, contentVersion: version });
  const saved = await Chunk.insertMany(chunkDocs);
  await Chunk.deleteMany({
    noteId: note._id,
    contentVersion: { $lt: version },
  });

  // Phase 3: reconcile.
  const newerExists = await Chunk.exists({
    noteId: note._id,
    contentVersion: { $gt: version },
  });
  if (newerExists) {
    await Chunk.deleteMany({ noteId: note._id, contentVersion: version });
  }

  const fresh = await Note.findById(note._id).select("isDeleted");
  if (fresh && fresh.isDeleted !== note.isDeleted) {
    await Chunk.updateMany(
      { noteId: note._id },
      { isDeleted: fresh.isDeleted },
    );
  }

  return saved;
};

const getChunksByNoteId = async (noteId) => {
  const chunks = await Chunk.find({ noteId }).sort({ chunkIndex: 1 });
  return chunks;
};

const syncChunkVissiblity = async (noteId) => {
  const note = await Note.findById(noteId).select("isDeleted isTrashed");
  if (!note) return;

  const isSearchable = !note.isDeleted && !note.isTrashed;
  await Chunk.updateMany({ noteId }, { isSearchable }, { timestamps: false });
};

module.exports = {
  createChunksForNote,
  getChunksByNoteId,
  syncChunkVissiblity,
};
