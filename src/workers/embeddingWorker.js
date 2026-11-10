const { Worker } = require("bullmq");
const connection = require("./../config/redis");
const Note = require("./../models/Note");
const chunkService = require("./../services/chunkServices");
const logger = require("./../config/logger");

const embeddingWorker = new Worker(
  'embedding',
  async (job) => {
    const { noteId } = job.data;

    const note = await Note.findById(noteId);
    if (!note) {
      logger.warn(`Embedding job skipped: note ${noteId} no longer exists`);
      return;
    }

    if (note.indexingStatus === 'completed') {
      logger.info(`Embedding job skipped: note ${noteId} is already indexed`);
      return;
    }

    const version = note.contentVersion;

    await Note.updateOne(
      { _id: noteId, contentVersion: version },
      { indexingStatus: 'processing' },
      { timestamps: false }
    );

    await chunkService.createChunksForNote(note);

    const result = await Note.updateOne(
      { _id: noteId, contentVersion: version },
      { indexingStatus: 'completed' },
      { timestamps: false }
    );

    if (result.modifiedCount === 0) {
      logger.info(`Note ${noteId} changed during indexing; a newer job will finish it`);
    } else {
      logger.info(`Indexing completed for note ${noteId} (version ${version})`);
    }
  },
  { connection, concurrency: 1 }
);

embeddingWorker.on('failed', async (job, error) => {
  if (!job) return;

  const maxAttempts = job.opts.attempts || 1;
  logger.error(
    `Indexing attempt ${job.attemptsMade}/${maxAttempts} failed for note ${job.data.noteId}: ${error.message}`
  );

  if (job.attemptsMade >= maxAttempts) {
    await Note.updateOne(
      { _id: job.data.noteId },
      { indexingStatus: 'failed' },
      { timestamps: false }
    );
  }
});

module.exports = embeddingWorker;
