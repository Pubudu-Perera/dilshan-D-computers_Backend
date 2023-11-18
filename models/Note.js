const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const noteSchema = new mongoose.Schema(

    {
        user : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'User'
        },

        title : {
            type : String,
            required : true
        },

        text : {
            type : String,
            required : true
        },

        completed : {
            type : Boolean,
            default : false
        }

    },

    // MongoDB auto configurations for Created & Updated date
    {
        timestamps : true
    }
)

// assign a ticket number for every Note document using package mongoose-sequence

noteSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 500
})

module.exports = mongoose.model('Note',noteSchema);