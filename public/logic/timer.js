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