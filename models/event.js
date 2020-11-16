const mongoose=require('mongoose');

const eventSchema=new mongoose.Schema({
    title: String,
    date: Date,
    start: Date,
    end: Date,
    recurring: Boolean,
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports=mongoose.model('Event',eventSchema);