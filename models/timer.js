const mongoose=require('mongoose');

const timerSchema=new mongoose.Schema({
    title: String,
    hours: Number,
    minutes: Number,
    seconds: Number,
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports=mongoose.model('Timer',timerSchema);