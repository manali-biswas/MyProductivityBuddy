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
    }],
    events:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Event"
    }],
    google:{
        accessToken: String,
        refreshToken: String
    },
    microsoft:{
        accessToken: String,
        refreshToken: String
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);