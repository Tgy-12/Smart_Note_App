const Note = require('./../models/Note');
const chunkService = require('./chunkServices');
const logger =  require('./../config/logger');
const ApiError = require('./../utils/ApiError');

const createNote = async (noteData) => {
  if (Array.isArray(noteData)) {
    const notes = await Note.insertMany(noteData);
    for (const note of notes) {
      await chunkService.createChunksForNote(note);
    }
    return notes;
  }
  const note = await Note.create(noteData);
  await chunkService.createChunksForNote(note);
  return note;
};
const getAllNotes = async (filters, pagination) => {
    const query = { isDeleted: { $ne: true }, userId: filters.userId};
     if (filters.tags) {
        query.tags = filters.tags
     }
     if (filters.isPinned) {
        query.isPinned = filters.isPinned === 'true';
     }
     if (filters.isArchived) {
        query.isArchived = filters.isArchived === 'true';
     }
     if (filters.isTrashed) {
        query.isTrashed = filters.isTrashed === 'true';
     }
     if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        query.$or = [
            { title: searchRegex },
            { content: searchRegex },
            { tags: searchRegex }
        ];
     };
    const page = Math.max(parseInt(pagination.page,10)|| 1, 1);
    // Math.min is used to ensure that the page is at most 100,
    // and Math.max is used to ensure that the page is at least 1.
    const limit = Math.max(Math.min(parseInt(pagination.limit,10)|| 10, 100), 1);
    const skip = (page - 1) * limit;
    const [notes, totalCount] = await Promise.all([
        Note.find(query).sort({createdAt: -1}).skip(skip).limit(limit),
        Note.countDocuments(query)
    ]);
const totalPages = Math.ceil(totalCount/limit);

return {
    notes,
    pagination:{
        currentPage:page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page<totalPages,
        hasPrevPage: page>1,
    }
 };
};


const getNoteById = async (id, userId) => {
    const note = await Note.findOne({_id: id, userId, isDeleted: false});
    return note;
};
const updateNote = async (id, notedata, userId) => {
    // converting to key,value pair with object.entries and filter them for those with value is undefined and then convert back to object with object.fromEntries
    const tempFields = Object.entries(notedata).filter(([, value]) => value !== undefined);
    const UpdateFields = Object.fromEntries(tempFields);//converting back to object from key,value pair
    const note = await Note.findOneAndUpdate(
        {_id: id,userId, isDeleted: false},
        UpdateFields, {
        new: true,
        runValidators: true,
    });
    if (note && UpdateFields.content !== undefined) {
            logger.info(`Content changed for note ${note._id} — re-chunking and re-embedding`);

      await chunkService.createChunksForNote(note)
    };
    return note;
};


const deleteNote = async (id, userId) => {
    const note = await Note.findOneAndUpdate(
        {_id: id,userId, isDeleted: false},
        {isDeleted: true, deletedAt: new Date() },
        {new: true }
    );
    return note;
};
const restoreNote = async(id, userId) => {
    const note = await Note.findOneAndUpdate(
        {_id:id,userId, isDeleted: true},
        {isDeleted: false, deletedAt: null},
        {new: true }
    );
    return note
};

const createNoteFromFile = async (extractedText, originalFilename, userId) => {
  const cleanedText = extractedText.trim();

  if (cleanedText.length === 0) {
    throw new ApiError(422, `No extractable text found in "${originalFilename}"`);
  }

  const noteData = {
    title: originalFilename,
    content: cleanedText,
    tags: ['uploaded'],
    userId,
  };

  const note = await Note.create(noteData);
  await chunkService.createChunksForNote(note);
  return note;
};

module.exports = {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote,
    restoreNote,
    createNoteFromFile
    };
