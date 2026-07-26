const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
    title:{
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be exceeding 200 char'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
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

  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model('Note', noteSchema);//this line of code is used to create a model called Note based on the noteSchema. The model is then used to interact with the notes collection in the MongoDB database.
module.exports = Note;
