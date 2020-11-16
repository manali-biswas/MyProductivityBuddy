// importing modules
const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const passport=require('passport');
const localStrategy=require('passport-local');
const expressSession=require('express-session');
const methodOverride=require('method-override');
const User=require('./models/user');
const Timer=require('./models/timer');
const Task=require('./models/task');
const Event=require('./models/event');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const {getAuth, listEvents}=require('./public/logic/google');

//connecting to database
mongoose.connect('mongodb+srv://manali:remember617@cluster0.dakug.mongodb.net/productivity?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true});

//declaring functions to be used by all routes
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use(expressSession({
    secret: "Manali",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// defining passport strategies
passport.use(new localStrategy(User.authenticate()));
passport.use(new GoogleStrategy({
    clientID: '991368878610-364g8bvnm8of93tsvfdk56s7gkl3bf2u.apps.googleusercontent.com',
    clientSecret: 'yugmojWz1n5BB_SZEGIreXsD',
    callbackURL: 'http://localhost:5000/callback'
}, function(accessToken, refreshToken, profile, done){
    const google={
        accessToken: accessToken,
        refreshToken: refreshToken
    };
    User.findOne({
        'username':profile.emails[0].value
    }, function(err,user){
        if(err){
            return done(err);
        }
        if(!user){            
            const user=new User({
                username: profile.emails[0].value,
                google: google
            });
            user.save(function(err){
                if(err){
                    console.log(err);
                }
                else{
                    return done(err, user);
                }
            });
        }
        else{
            user.google=google;
            user.save(function(err){
                if(err){
                    console.log(err);
                }
                else{
                    return done(err,user);
                }
            });
        }
    });
}));
// user serialization
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

//helper functions
function groupBy(objectArray, property){
    return objectArray.reduce(function(acc,obj){
        const key = obj[property];
        if(!acc[key]){
            acc[key]=[]
        }
        acc[key].push(obj);
        return acc;
    },{});
};

const middleware=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/signup');
}

const gmiddle=function(req,res,next){
    if(req.isAuthenticated()){
        User.findById(req.user.id,function(err,user){
            if(err){
                console.log(err);
                res.redirect('/auth/google');
            }else{
                if(user.google.accessToken){
                    return next();
                }
                else{
                    res.redirect('/auth/google');
                }
            }
        });
    }else{
        res.redirect('/auth/google');
    }
}

const port=process.env.PORT || 5000;
 // all routes
 // home route
app.get('/',function(req,res){
    res.render('home');
});

// calendar route
app.get('/events',middleware,function(req,res){
    res.render('events');
});

app.post('/events/day',middleware,function(req,res){
    res.render('partials/day',{date: req.body.date});
});

app.post('/events/week',middleware,function(req,res){
    res.render('partials/week',{date: req.body.date});
});

app.post('/events/month',middleware,function(req,res){
    res.render('partials/month',{date: req.body.date});
});

app.post('/events/year',middleware,function(req,res){
    res.render('partials/year',{date: req.body.date});
});

// google calendar route
app.get('/google',gmiddle,function(req,res){
    User.findById(req.user.id, async function(err,user){
        if(err){
            console.log(err);
            res.redirect('/');
        }else{
            const auth=getAuth(user.google.accessToken,user.google.refreshToken);   
            const events=await listEvents(auth);
            const eventsfinal=await events.reduce(function(acc,event){
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                var to = event.end.dateTime;
                if (!to) {
                    to = event.end.date;
                }
                const obj={
                    summary: event.summary,
                    when: when,
                    to: to
                }
                acc.push(obj);
                return acc;
            },[]);
            res.render('google',{events:await eventsfinal});
        }
    });
});

// timer route
app.get('/timer',middleware,function(req,res){
    User.findById(req.user.id).populate('timers').exec(function(err,user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        res.render('timer',{userdata:user});
    });    
});

// saving a timer route
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

// editing a timer route
app.put('/timer/:id',middleware,function(req,res){
    const timer={
        hours: parseInt(req.body.hours2),
        minutes: parseInt(req.body.minutes2),
        seconds: parseInt(req.body.seconds2)
    }
    Timer.findByIdAndUpdate(req.params.id,timer,function(err,task){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{
            res.redirect('/timer');
        }
    });
});

// deleting a timer route
app.delete('/timer/:id',middleware,function(req,res){
    Timer.findByIdAndDelete(req.params.id,function(err){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{
            res.redirect('/timer');
        }
    });
});

// tasks route
app.get('/tasks',middleware,function(req,res){
    User.findById(req.user.id).populate('tasks').exec(function(err,user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        tasks=groupBy(user.tasks,'date');
        const orderedtasks={};
        Object.keys(tasks).sort().forEach(function(key){
            orderedtasks[key]=tasks[key];
        });
        res.render('tasks',{tasks:orderedtasks});
    });    
});

// saving a task route
app.post('/tasks',middleware,function(req,res){
    const task = {
        title: req.body.title,
        date: req.body.date,
        userid: req.user
    }

    User.findById(req.user.id,function(err,user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{
            Task.create(task, function(err, task){
                if(err){
                    console.trace(err);
                    res.redirect('/');
                }
                else{
                    user.tasks.push(task);
                    user.save();
                    res.redirect('/tasks');
                }
            });
        }
    }); 
});

// edting a task route
app.put('/tasks/:id',middleware,function(req,res){
    Task.findByIdAndUpdate(req.params.id,{title:req.body.title},function(err,task){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{
            res.redirect('/tasks');
        }
    });
});

// deleting a task route
app.delete('/tasks/:id',middleware,function(req,res){
    Task.findByIdAndDelete(req.params.id,function(err){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{
            res.redirect('/tasks');
        }
    });
});

// google oauth route
app.get('/auth/google', passport.authenticate('google',{
    scope: ['https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/userinfo.email',
        "https://www.googleapis.com/auth/calendar.readonly"
      ]
}));

// google oauth callback route
app.get('/callback',passport.authenticate('google',{
    failureRedirect:'/login',
    successRedirect: '/google'
}));

// user register route
app.get('/signup',function(req,res){
    res.render('signup');
});

// saving registered user route
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

// login route
app.get('/login',function(req,res){
    res.render('login');
});

// user login authentication route
app.post('/login',passport.authenticate('local',{
    successRedirect: '/timer',
    failureRedirect: '/'
}));

// logout route
app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
});

// routes listener
app.listen(port,process.env.IP,function(){
    console.log('Server is listening at '+port);
});