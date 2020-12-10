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
    else if(id=="#decade"){
        $.ajax({type:'POST',url:"/events/decade", data:{date:date},success:function(result){
            target.html(result);
        }});
        t.html('Decade');
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
    else if(id=="decade"){
        date.setFullYear(date.getFullYear()+10);
        $.ajax({type:'POST',url:"/events/decade", data:{date:date},success:function(result){
            $('#decade').html(result);
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
    else if(id=="decade"){
        date.setFullYear(date.getFullYear()-10);
        $.ajax({type:'POST',url:"/events/decade", data:{date:date},success:function(result){
            $('#decade').html(result);
        }});
    }
});

// to display year when clicked in the decade view
$(document).on('click','.decadebtn',function(event){
    var id=$(this).attr('id');
    var t=$('.dropdown-toggle');
    t.html('Year');
    date=new Date(id,0,2);
    $.ajax({type:'POST',url:'/events/year',data:{date:date},success:function(result){
        $('#year').html(result);
    }});
    var target=$('#year');
    target.addClass('d');
    target.removeClass('n');
    var ex=$('#decade');
    ex.removeClass('d');
    ex.addClass('n');
    var dtarget=$("a[href$='#year']");
    var dex=$("a[href$='#decade']");
    dex.removeClass('active');
    dtarget.addClass('active');    
});

// to display month when clicked in the year view
$(document).on('click','.yearbtn',function(event){
    var id=$(this).attr('id');
    var t=$('.dropdown-toggle');
    t.html('Month');
    date=new Date(date.getFullYear(),keys[id],2);
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

// function to edit event name
$(document).on('click','.edit',function(event){
    const btn=$(this);
    btn.addClass('n');
    const btn2=btn.next('.myc');
    btn2.removeClass('n');
    btn2.addClass('on');
    const form=$(this).closest('form');
    const events=form.find('.a');
    events.removeClass('n');
    events.addClass('on');
    const h=form.find('.event');
    h.addClass('n');
    event.stopPropagation();
});