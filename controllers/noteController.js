const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');

// @desc get all notes
// @route GET /notes
// @access private
const getAllNotes = asyncHandler(async (req,res) => {
    
    const notes = await Note.find().lean();

    // if no notes
    if (!notes?.length) {
        return res.status(400).json({message : "No notes to display!"});
    }

     // Add username to each note before sending the response 
    const notesWithUsers = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return {...note, username : user.username }
    }));

    res.json(notesWithUsers);
});



// @desc create a note
// @route POST /notes
// @access private
const createNote = asyncHandler(async (req,res) => {

    const {user, title, text} = req.body;

    // check all required fields are filled with data
    if (!user || !title || !text) {
        return res.status(400).json({message : "All fields are required"});
    }

    // check if there are any duplicate notes with same title
    const duplicate = await Note.findOne({title}).collation({ locale : 'en', strength : 2}).lean().exec()

    if (duplicate) {
        return res.status(409).json({message : "There is a note with this title!"});
    }

    // Making anew note
    // With Javascript destructuring  
    // send POST request to the database 
    const noteCreation = await Note.create({
        user, title, text
    });

    if (noteCreation) {
        return res.status(201).json({message : `New note with title ${title} is created!`});
    }else{
        return res.status(400).json({message : "Invalid note data recieved!"});
    }
});



// @desc update a note
// @route PATCH /notes
// @access private
const updateNote = asyncHandler(async (req,res) => {

    const {id, user, title, text, completed} = req.body;

    // check all required fields are filled with data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({message : "All fields are required!"});
    }

    const updatingNote = await Note.findById(id).exec();

    if (!updatingNote) {
        return res.status(400).json({message : "Note not found!"});
    }

    // checks duplicates 
    const duplicate = await Note.findOne({title}).collation({ locale : 'en', strength : 2}).lean().exec();

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message : "Duplicate Title!"});
    }

    updatingNote.title = title;
    updatingNote.text = text;
    updatingNote.completed = completed;
    updatingNote.user = user;

    const updatedNote = await updatingNote.save();

    res.json({message : `Note with title ${updatedNote.title} updated successfully!`});
});



// @desc delete a note
// @route DELETE /notes
// @access private
const deleteNote = asyncHandler(async (req,res) => {

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Note ID required!" });
    }

    // Confirm note exists to delete
    const note = await Note.findById(id).exec();

    if (!note) {
      return res.status(400).json({ message: "Note not found" });
    } 

    const result = await note.deleteOne();

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
});


module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
}