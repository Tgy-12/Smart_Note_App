const asyncHandler = require('./../utils/asyncHandler');
const noteService = require('./../services/noteService');
const ApiError = require('./../utils/ApiError');

const createNoteV = async (req, res) => {

    const isBulk = Array.isArray(req.body);
    const note = await noteService.createNote(req.body);
    res.status(201).json({
        status: true,
        message: isBulk
        ? `${note.length} notes created successfully`
        : "Note created succefully",
        data: note,
    });
};
const getAllNotesV = async (req, res) => {
    const { tags, isPinned, isArchived, isTrashed, search, page, limit } = req.query;
    const filters = { tags, isPinned, isArchived, isTrashed, search };
    const pages = { page, limit };
    const result = await noteService.getAllNotes(filters, pages);
    res.status(200).json({
        status : true,
        message: "Notes retrieved successfully",
        count: result.notes.length,
        pagination: result.pagination,
        data: result.notes,
    });
};
const getNoteByIdV = async (req, res) => {
    const {id } = req.params;
    const note = await noteService.getNoteById(id);
    if (!note) {
        throw new ApiError(404, `Note not found with id ${id}`);
    }
    res.status(200).json({
        status: true,
        message: "Note retrieved successfully",
        data: note,
    });
};
const updateNoteV = async (req, res) => {
    const { id } = req.params;
    const { title, content, tags, isPinned, isArchived } = req.body;
    const notedatta = { title, content, tags, isPinned, isArchived };
    const note = await noteService.updateNote(id, notedatta);
    if (!note) {
        throw new ApiError(404, `Note not found with id ${id}`);
    }
    res.status(200).json({
        status: true,
        message: "Note updated successfully",
        data: note,
    });
};
const deleteNoteV = async (req, res) => {
    const { id } = req.params;
    const note = await noteService.deleteNote(id);
    if (!note) {
        throw new ApiError(404, `Note not found with id ${id}`);
    }
    res.status(200).json({
        status: true,
        message: "Note deleted successfully",
        data: note,
    });
};
const restoreNoteV = async(req, res)=>{
    const { id } = req.params;
    const note = await noteService.restoreNote(id);
    if (!note) {
        throw new ApiError(404, `No deleted Note is found with the id of ${id}`)
    }
    res.status(200).json({
        status: true,
        message: "Note restored succefully",
        data: note,
    });
};
const createNote = asyncHandler(createNoteV);
const getAllNotes = asyncHandler(getAllNotesV);
const getNoteById = asyncHandler(getNoteByIdV);
const updateNote = asyncHandler(updateNoteV);
const deleteNote = asyncHandler(deleteNoteV);
const restoreNote = asyncHandler(restoreNoteV);

module.exports = { createNote, getAllNotes, getNoteById, updateNote, deleteNote, restoreNote };
