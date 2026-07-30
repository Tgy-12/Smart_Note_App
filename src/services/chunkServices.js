const Chunk = require('./../models/Chunk');
const chunkText = require('./../utils/chunkUtils');
const embeddingService = require('./embeddingservice');
const logger = require('./../config/logger');

const createChunksForNote = async (note) => {
  await Chunk.deleteMany({ noteId: note._id });

  const pieces = chunkText(note.content);

  const chunkDocs = [];

  for (let index = 0; index < pieces.length; index += 1) {
    const piece = pieces[index];
    const embedding = await embeddingService.generateEmbedding(piece.text);

    chunkDocs.push({
      noteId: note._id,
      chunkIndex: index,
      text: piece.text,
      tokenCount: piece.tokenCount,
      embedding,
    });

    logger.info(`Embedded chunk ${index + 1}/${pieces.length} for note ${note._id}`);
  }

  const savedChunks = await Chunk.insertMany(chunkDocs);
  return savedChunks;
};

const getChunksByNoteId = async (noteId) => {
  const chunks = await Chunk.find({ noteId }).sort({ chunkIndex: 1 });
  return chunks;
};

module.exports = {
  createChunksForNote,
  getChunksByNoteId,
};
