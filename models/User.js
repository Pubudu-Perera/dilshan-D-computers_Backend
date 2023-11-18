const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    username : {
        type : String,
        required : true
    },

    password : {
        type : String,
        required : true
    },

    // roles is an array of objects
    roles : [{
        type : String,
        default : "Employee"
    }],

    active : {
        type : Boolean,
        default : true
    }
});


module.exports = mongoose.model('User',userSchema);