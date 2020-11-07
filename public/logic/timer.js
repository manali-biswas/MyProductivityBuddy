$(".start").on("click",function(event){
    document.getElementById("timeleft").innerHTML='';
    document.getElementById("timeup").innerHTML='';
    event.stopPropagation();
    var hours=$("#hours").val()
    var minutes=$("#minutes").val()
    var seconds=$("#seconds").val()
    var total=(hours*60*60+minutes*60+seconds)*1000+2000;
    var start=Date.now();
    var left;
    
    var func=setInterval(function(){
        left=total-(Date.now()-start);
        var string='';
        string+=Math.floor(left/(1000*60*60));
        string+=':';
        string+=Math.floor((left%(1000*60*60))/(1000*60));
        string+=':';
        string+=Math.floor((left%(1000*60))/(1000));

        document.getElementById("timeleft").innerHTML=string;
        console.log(string);
        if(left<0){
            document.getElementById("timeleft").innerHTML='0:0:0';
            clearInterval(func);
            document.getElementById("timeup").innerHTML='Time Up!';
        }
        
    },1000);   
});

$('.select').on('click',function(event){
    const time=$(this).prev();
    const hours=time.find('.hours').text();
    const minutes=time.find('.minutes').text();
    const seconds=time.find('.seconds').text();
    $('#hours').val(parseInt(hours));
    $('#minutes').val(parseInt(minutes));
    $('#seconds').val(parseInt(seconds));
});

$('.save').on('click',function(event){
    const title = prompt('Enter the Timer name');
    $('#title').val(title);
});

$('.edit').on('click',function(event){
    const btn=$(this);
    btn.addClass('hid');
    const btn2=btn.next('.myc');
    btn2.removeClass('hid');
    btn2.addClass('on');
    const form=$(this).closest('form');
    const hours=form.find('.a');
    hours.removeClass('hid');
    hours.addClass('on');
    const minutes=form.find('.b');
    minutes.removeClass('hid');
    minutes.addClass('on');
    const seconds=form.find('.c');
    seconds.removeClass('hid');
    seconds.addClass('on');
    const h=form.find('.hours');
    h.addClass('hid');
    const m=form.find('.minutes');
    m.addClass('hid');
    const s=form.find('.seconds');
    s.addClass('hid');
});