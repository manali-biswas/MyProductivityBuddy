const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    timers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Timer"
    }],
    tasks:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Task"
    }]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);