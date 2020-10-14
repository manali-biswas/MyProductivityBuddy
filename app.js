const express=require('express');
const app=express();


app.use(express.static("public"));
app.set('view engine','ejs');
const port=process.env.PORT || 5000;


app.get('/',function(req,res){
    res.render('home');
});

app.get('/google',function(req,res){
    res.render('google');
})

app.listen(port,process.env.IP,function(){
    console.log('Server is listening at '+port);
});