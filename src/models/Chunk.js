const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    //isDeleted: { type: Boolean, default: false, index: true },
    isSearchable: { type: Boolean, default: true, index: true },
    contentVersion: { type: Number, default: 0 },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    tokenCount: { type: Number, required: true },
    embedding: { type: [Number], default: [] },
  },
  { timestamps: true },
);
chunkSchema.index(
  { noteId: 1, contentVersion: 1, chunkIndex: 1 },
  { unique: true },
);
const Chunk = mongoose.model("Chunk", chunkSchema);

module.exports = Chunk;
