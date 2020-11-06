const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const passport=require('passport');
const localStrategy=require('passport-local');
const expressSession=require('express-session');
const User=require('./models/user');
const Timer=require('./models/timer');


mongoose.connect('mongodb+srv://manali:remember617@cluster0.dakug.mongodb.net/productivity?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true});

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(expressSession({
    secret: "Manali",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

const middleware=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/signup');
}

const port=process.env.PORT || 5000;

app.get('/',function(req,res){
    res.render('home');
});

app.get('/google',function(req,res){
    res.render('google');
});

app.get('/timer',middleware,function(req,res){
    User.findById(req.user.id).populate('timers').exec(function(err,user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        res.render('timer',{userdata:user});
    });    
});

app.post('/timer',middleware,function(req,res){
    const timer={
        title: req.body.title,
        hours: req.body.hours,
        minutes: req.body.minutes,
        seconds: req.body.seconds,
        userid: req.user
    }

    User.findById(req.user.id,function(err,user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{
            Timer.create(timer, function(err, timer){
                if(err){
                    console.trace(err);
                    res.redirect('/');
                }
                else{
                    user.timers.push(timer);
                    user.save();
                    res.redirect('/timer');
                }
            });
        }
    });    
});

app.get('/signup',function(req,res){
    res.render('signup');
});

app.post('/signup',function(req,res){
    User.register(new User({username:req.body.username}), req.body.password, function(err, user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        passport.authenticate('local')(req,res,function(){
            res.redirect('/timer');
        });
    });
});

app.get('/login',function(req,res){
    res.render('login');
});

app.post('/login',passport.authenticate('local',{
    successRedirect: '/timer',
    failureRedirect: '/'
}));

app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
});

app.listen(port,process.env.IP,function(){
    console.log('Server is listening at '+port);
});