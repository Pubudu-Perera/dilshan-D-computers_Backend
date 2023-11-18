const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler'); //Easily handles try-catch part of async methods. DO NOT need to declare try-catch
const bcrypt = require('bcrypt');

// @desc get all users
// @route GET /users
// @access private
const getAllUsers = asyncHandler(async (req,res) => {

    const users = await User.find().select('-password').lean();  // select() for send the user data without password values

    if (!users?.length) {
        return res.status(400).json({message : "No User Data"});
    }

    res.json(users);

});



// @desc add new user
// @route POST /users
// @access private
const createUser = asyncHandler(async (req,res) => {

    // data which is coming from the request
    const {username, password, roles} = req.body; //attributes must be same as the keys passed in the request

    // Checks all fields are filled
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message : "All fields are required!"});
    }

    // Checks for duplicates
    // coolation method use to identify unique values with case insensitivity.
    //lean() use to fetch only the necessary attribute instead of fetching entire object
    const duplicate = await User.findOne({username}).collation({ locale : 'en', strength : 2}).lean().exec();

    if (duplicate) {
        return res.status(409).json({message : "The username is already taken!"});
    }

    // encrypt the password
    const hashedPassword = await bcrypt.hash(password,10);

    // Making the new user object
    const newUser = {
        username : username,
        "password" : hashedPassword,
        roles : roles
    }

    // send the POST request to the database
    const user = await User.create(newUser);

    if (user) {
        res.status(201).json({message : `User ${username} is successfully created!`});
    }else{
        res.status(400).json({message : `Invalid User data recieved!`});
    }

});



// @desc update an user
// @route PATCH /users
// @access private
const updateUser = asyncHandler(async (req,res) => {

    const { id, username, roles, active, password } = req.body;

    // Confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean' ) {
        return res.status(400).json({message : "All fields except password are required"});
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({message : "User not found!"});
    }

    // check for duplicate
    // If the edited username is same as any OTHER existing usernames
    const duplicate = await User.findOne({username}).collation({ locale : 'en', strength : 2}).lean().exec();

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message : "Duplicate Username!"});
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password) {
        const hashedPassword = await bcrypt.hash(password);
        user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.json({message : `User ${updatedUser.username} updated successfully!`});
});



// @desc delete an user
// @route DELETE /users
// @access private
const deleteUser = asyncHandler(async (req,res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({message : 'User ID required!'});
    }

    // Check the user is being deleted has assigned to any notes.
    // Does the user still have assigned notes?
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({message : "User not found!"});
    }

    const result = await user.deleteOne();

    const reply = `User with username ${result.username} with ID ${result._id} successfully deleted!`;

    res.json(reply);
});


module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}
