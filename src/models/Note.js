const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot be exceeding 200 char"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    indexingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    contentVersion: {
      type: Number,
      default: 0,
    }, //this is used to track the version of the note's content. Each time the content is updated, this version number can be incremented to reflect the change. This can be useful for maintaining a history of changes or for implementing features like undo/redo or version control.
  },
  {
    timestamps: true,
  },
);

const Note = mongoose.model("Note", noteSchema); //this line of code is used to create a model called Note based on the noteSchema. The model is then used to interact with the notes collection in the MongoDB database.
module.exports = Note;
