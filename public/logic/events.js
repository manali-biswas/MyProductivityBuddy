var date=new Date();
const keys={'January':0,'February':1,'March':2,'April':3,'May':4,'June':5,'July':6,'August':7,'September':8,'October':9,'November':10,'December':11};

// different calendar views
$('.dropdown-item').on('click',function(event){
    var x=$('.dropdown-item.active');
    x.removeClass('active');
    $(this).addClass('active');
    var g=$('.d');
    g.removeClass('d');
    g.addClass('n');
    var id=$(this).attr('href');
    var target=$(id);
    target.removeClass('n');
    target.addClass('d');
    var t=$('.dropdown-toggle');
    date=new Date();
    if(id=="#day"){
        $.ajax({type:'POST',url:"/events/day", data:{date:date},success:function(result){
            target.html(result);
        }});
        t.html('Day');
    }
    else if(id=='#week'){
        $.ajax({type:'POST',url:"/events/week", data:{date:date},success:function(result){
            target.html(result);
        }});
        t.html('Week');
    }
    else if(id=="#month"){
        $.ajax({type:'POST',url:"/events/month", data:{date:date},success:function(result){
            target.html(result);
        }});
        t.html('Month');
    }
    else if(id=="#year"){
        $.ajax({type:'POST',url:"/events/year", data:{date:date},success:function(result){
            target.html(result);
        }});
        t.html('Year');
    }
});

// incrementing the calendar view dates
$('.inc').on('click',function(event){  
    var id=$('.d').attr('id');
    if(id=="day"){
        date.setDate(date.getDate()+1);
        $.ajax({type:'POST',url:"/events/day", data:{date:date},success:function(result){
            $('#day').html(result);
        }});
    }
    else if(id=='week'){
        date.setDate(date.getDate()+7);
        $.ajax({type:'POST',url:"/events/week", data:{date:date},success:function(result){
            $('#week').html(result);
        }});
    }
    else if(id=="month"){
        if(date.getMonth()<11)
        date=new Date(date.getFullYear(),date.getMonth()+1,2);
        else
        date=new Date(date.getFullYear()+1,0,2);
        $.ajax({type:'POST',url:"/events/month", data:{date:date},success:function(result){
            $('#month').html(result);
        }});
    }
    else if(id=="year"){
        date.setFullYear(date.getFullYear()+1);
        $.ajax({type:'POST',url:"/events/year", data:{date:date},success:function(result){
            $('#year').html(result);
        }});
    }
    
});

// decrementing the calendar view dates
$('.dec').on('click',function(event){  
    var id=$('.d').attr('id');
    if(id=="day"){
        date.setDate(date.getDate()-1);
        $.ajax({type:'POST',url:"/events/day", data:{date:date},success:function(result){
            $('#day').html(result);
        }});
    }
    else if(id=='week'){
        date.setDate(date.getDate()-7);
        $.ajax({type:'POST',url:"/events/week", data:{date:date},success:function(result){
            $('#week').html(result);
        }});
    }
    else if(id=="month"){
        if(date.getMonth()>0)
        date=new Date(date.getFullYear(),date.getMonth()-1,2);
        else
        date=new Date(date.getFullYear()-1,11,2);
        $.ajax({type:'POST',url:"/events/month", data:{date:date},success:function(result){
            $('#month').html(result);
        }});
    }
    else if(id=="year"){
        date.setFullYear(date.getFullYear()-1);
        $.ajax({type:'POST',url:"/events/year", data:{date:date},success:function(result){
            $('#year').html(result);
        }});
    }
    
});

// to display month when clicked in the year view
$(document).on('click','.yearbtn',function(event){
    var id=$(this).attr('id');
    var t=$('.dropdown-toggle');
    t.html('Month');
    date=new Date(date.getFullYear(),keys[id],1);
    $.ajax({type:'POST',url:'/events/month',data:{date:date},success:function(result){
        $('#month').html(result);
    }});
    var target=$('#month');
    target.addClass('d');
    target.removeClass('n');
    var ex=$('#year');
    ex.removeClass('d');
    ex.addClass('n');
    var dtarget=$("a[href$='#month']");
    var dex=$("a[href$='#year']");
    dex.removeClass('active');
    dtarget.addClass('active');    
});

// to display day when clicked in the month view
$(document).on('click','.monthbtn',function(){
    var d=$(this).attr('id');
    date =new Date(d);

    $.ajax({type:'POST',url:'/events/day',data:{date:date},success:function(result){
        $('#day').html(result);
    }});
    var t=$('.dropdown-toggle');
    t.html('Day');
    var target=$('#day');
    target.addClass('d');
    target.removeClass('n');
    var ex=$('#month');
    ex.removeClass('d');
    ex.addClass('n');
    var dtarget=$("a[href$='#day']");
    var dex=$("a[href$='#month']");
    dex.removeClass('active');
    dtarget.addClass('active'); 
});

// to display day when clicked in the week view
$(document).on('click','.weekbtn',function(){
    var d=$(this).attr('id');
    date =new Date(d);

    $.ajax({type:'POST',url:'/events/day',data:{date:date},success:function(result){
        $('#day').html(result);
    }});
    var t=$('.dropdown-toggle');
    t.html('Day');
    var target=$('#day');
    target.addClass('d');
    target.removeClass('n');
    var ex=$('#week');
    ex.removeClass('d');
    ex.addClass('n');
    var dtarget=$("a[href$='#day']");
    var dex=$("a[href$='#week']");
    dex.removeClass('active');
    dtarget.addClass('active'); 
});