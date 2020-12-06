const mongoose=require('mongoose');

const eventSchema=new mongoose.Schema({
    title: String,
    date: String,
    start: Date,
    end: Date,
    repeat: {
        value: Boolean,
        period: String
    },
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports=mongoose.model('Event',eventSchema);