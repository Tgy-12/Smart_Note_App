const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    tokenCount: {
      type: Number,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Chunk = mongoose.model('Chunk', chunkSchema);

module.exports = Chunk;
