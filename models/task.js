const mongoose=require('mongoose');

const taskSchema=new mongoose.Schema({
    title: String,
    date: String,
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports=mongoose.model('Task',taskSchema);