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
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const refresh = require('passport-oauth2-refresh');
const {getAuth, listEvents}=require('./public/logic/google');
const {getGraphAuth, getCalendarView}=require('./public/logic/microsoft');

//connecting to database
mongoose.connect('mongodb+srv://manali:remember617@cluster0.dakug.mongodb.net/productivity?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:true});

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
const googlestrategy=new GoogleStrategy({
    clientID: '991368878610-364g8bvnm8of93tsvfdk56s7gkl3bf2u.apps.googleusercontent.com',
    clientSecret: 'yugmojWz1n5BB_SZEGIreXsD',
    callbackURL: 'https://myproductivitybuddy.herokuapp.com/callback',
    passReqToCallback:true
}, function(req,accessToken, refreshToken, profile, done){
    const google={
        accessToken: accessToken,
        refreshToken: refreshToken
    };
    
    if(req.user){//checking is user logged in
    User.findOne({
        'username':req.user.username
    }, function(err,user){
        if(err){
            return done(err);
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
    }
    else{
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
    }
});
passport.use(googlestrategy);
// http://localhost:5000/auth/microsoft/callback
const microsoftstrategy=new MicrosoftStrategy({
    clientID: '14c15fd0-d4e1-4347-ab3e-dc6126fd9340',
    clientSecret: 'dZ~n-IfU0x~8b7rMO4_w.lt2-52can0-W_',
    callbackURL: 'https://myproductivitybuddy.herokuapp.com/auth/microsoft/callback',
    passReqToCallback:true
},function(req,accessToken, refreshToken, profile, done){
    const microsoft={
        accessToken: accessToken,
        refreshToken: refreshToken
    };

    if(req.user){// checking if user logged in
    User.findOne({
        'username':req.user.username
    }, function(err,user){
        if(err){
            return done(err);
        }
        else{
            user.microsoft=microsoft;
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
        }
        
        else{
            User.findOne({
                'username':profile.emails[0].value
            }, function(err,user){
                if(err){
                    return done(err);
                }
                if(!user){
                    const user=new User({
                        username: profile.emails[0].value,
                        microsoft: microsoft
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
    });
    }
});
passport.use(microsoftstrategy);
// user serialization
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
refresh.use(googlestrategy);
refresh.use(microsoftstrategy);

app.use(async function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.likes = await User.count({like: true});
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

function groupPeriod(events,userevents, date){
    var req=new Date(date);
    if(!events[date]){
        events[date]=[];
    }
            userevents.forEach(function(event){    
                var pre=new Date(event.date);
                if(req-pre>0){
                if(event.repeat.period=='daily'){
                    events[date].push(event);
                }
                else if(event.repeat.period=='weekly'&&req.getDay()==pre.getDay()){
                    events[date].push(event);
                }
                else if(event.repeat.period=='monthly'&&req.getDate()==pre.getDate()){
                    events[date].push(event);
                }
                else if(event.repeat.period=='yearly'&&req.getDate()==pre.getDate()&&req.getMonth()==pre.getMonth()){
                    events[date].push(event);
                }}
            });
        
    return events;
};

function groupByTime(objectArray, property){
    return objectArray.reduce(function(acc,obj){
        const key = obj[property].getHours();
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
                if(user.google.refreshToken){
                    refresh.requestNewAccessToken('google',user.google.refreshToken,function(err,accessToken,refreshToken){
                        user.google.accessToken=accessToken;
                        user.google.refreshToken=refreshToken;
                        user.save();
                    })
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

const outmiddle=function(req,res,next){
    if(req.isAuthenticated()){
        User.findById(req.user.id,function(err,user){
            if(err){
                console.log(err);
                res.redirect('/auth/microsoft');
            }else{
                if(user.microsoft.refreshToken){
                    refresh.requestNewAccessToken('microsoft',user.microsoft.refreshToken,function(err,accessToken,refreshToken){
                        user.microsoft.accessToken=accessToken;
                        user.save();
                    })
                    return next();
                }
                else{
                    res.redirect('/auth/microsoft');
                }
            }
        });
    }else{
        res.redirect('/auth/microsoft');
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

// save a calendar
app.post('/events',middleware,function(req,res){
    var repeat;
    if(req.body.repeat == "false")
    {
        repeat={
            value: false,
            period: undefined
        }
    }
    else
    {
        repeat={
            value: true,
            period: req.body.repeat
        }
    }
    const date=new Date(req.body.date);
    var event={
        title: req.body.title,
        date: date.toLocaleDateString(),
        start: new Date(req.body.date+' '+req.body.start),
        end: new Date(req.body.date+' '+req.body.end),
        repeat: repeat,
        userid: req.user
    }
    User.findById(req.user.id,function(err,user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{
            Event.create(event, function(err, event){
                if(err){
                    console.trace(err);
                    res.redirect('/');
                }
                else{
                    user.events.push(event);
                    user.save();
                    res.redirect('/events');
                }
            });
        }
    });    
});

// editing an event route
app.put('/events/:id',middleware,function(req,res){
    const event={
        title: req.body.title
    };
    Event.findByIdAndUpdate(req.params.id,event,function(err,task){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{
            res.redirect('/events');
        }
    });
});

app.delete('/events/:id',middleware,function(req,res){
    Event.findByIdAndDelete(req.params.id,function(err){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{
            res.redirect('/events');
        }
    });
});

app.post('/events/day',middleware,function(req,res){
    User.findById(req.user.id).populate('events').exec(function(err,user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{  
            const date=new Date(req.body.date);
            var events=groupBy(user.events,'date');
            events=groupPeriod(events,user.events,date.toLocaleDateString());
            if(events[date.toLocaleDateString()])
            res.render('partials/day',{date: req.body.date,events: groupByTime(events[date.toLocaleDateString()],'start')});
            else
            res.render('partials/day',{date: req.body.date,events: {}});
        }
    });
});

app.post('/events/week',middleware,function(req,res){
    User.findById(req.user.id).populate('events').exec(function(err,user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{  
            var x=new Date(req.body.date); 
            var last=new Date(x.toDateString());
            var weekevents={};
            last.setDate(last.getDate()+7-last.getDay()); 
            x.setDate(x.getDate()-x.getDay());
            const date=new Date(req.body.date);
            date.setDate(date.getDate()-date.getDay());
            var events=groupBy(user.events,'date');
            for(;x.toDateString()!=last.toDateString();x.setDate(x.getDate()+1))
            {
                events=groupPeriod(events,user.events,x.toLocaleDateString());
                if(events[x.toLocaleDateString()]){                    
                    weekevents[x.toLocaleDateString()]=groupByTime(events[x.toLocaleDateString()],'start');
                }
                else{
                    weekevents[x.toLocaleDateString()]={};
                }
            }
            last.setDate(last.getDate()-1);
            res.render('partials/week',{x: date,last: last, events: weekevents});    
        }
    });
});

app.post('/events/month',middleware,function(req,res){
    User.findById(req.user.id).populate('events').exec(function(err,user){
        if(err){
            console.trace(err);
            res.redirect('/');
        }
        else{ 
            var x=new Date(req.body.date); 
            var month=((x.getMonth()==11)?0:x.getMonth()+1); 
            var first=new Date(x.getFullYear(),x.getMonth(),1);
            var last;
            if(month==0) last=new Date(x.getFullYear()+1,0,1); 
            else last=new Date(x.getFullYear(),month,1); 
            last.setDate(last.getDate()-1);
            var weeks=((first.getDay()-0)+(6-last.getDay())+(last.getDate()-first.getDate()+1))/7;
            first.setDate(first.getDate()-first.getDay());
            last.setDate(last.getDate()-last.getDay()+6);
            var events=groupBy(user.events,'date');
            var y=new Date(first.toLocaleDateString());
            last.setDate(last.getDate()+1);
            for(;y.toDateString()!=last.toDateString();y.setDate(y.getDate()+1)){
                events=groupPeriod(events,user.events,y.toLocaleDateString());
            }
            last.setDate(last.getDate()-1);
            res.render('partials/month',{x: x,first:first,last: last,weeks:weeks, events: events});    
        }
    });
});

app.post('/events/year',middleware,function(req,res){
    res.render('partials/year',{date: req.body.date});
});

app.post('/events/decade',middleware,function(req,res){
    res.render('partials/decade',{date: req.body.date});
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
            res.render('google',{events:events});
        }
    });
});

// outlook calendar route
app.get('/outlook',outmiddle,function(req,res){
    User.findById(req.user.id, async function(err, user){
        if(err){
            console.log(err);
            res.redirect('/');
        }
        else{
            const auth=getGraphAuth(user.microsoft.accessToken,user.microsoft.refreshToken);
            const now=new Date();
            const end=new Date();
            end.setDate(end.getDate()+1);
            const events=await getCalendarView(auth,now.toISOString(),end.toISOString());
            res.render('microsoft',{events: events.value});
        }
    })
})

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
      ],
      accessType:'offline'
}));

// use authorize instead of authenticate to merge accounts

// google oauth callback route
app.get('/callback',passport.authenticate('google',{
    failureRedirect:'/login',
    successRedirect: '/google'
}));

// microsoft oauth route
app.get('/auth/microsoft', passport.authenticate('microsoft',{
    scope: ['user.read',
    'calendars.readwrite',
    'mailboxsettings.read',
    "offline_access"
    ],
    accessType:'offline',
    approvalPrompt: 'force'
}));

// microsoft oauth callback route
app.get('/auth/microsoft/callback',passport.authenticate('microsoft',{
    failureRedirect:'/login',
    successRedirect: '/outlook'
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

// like route
app.post('/like',middleware,function(req,res){
    User.findById(req.user.id,function(err,user){
        if(err){
            console.log(err);
            res.redirect('/');
        }
        else{
            if(user.like) user.like=false;
            else user.like=true;
            user.save();
            res.redirect('/timer');
        }
    });
});

// routes listener
app.listen(port,process.env.IP,function(){
    console.log('Server is listening at '+port);
});