$(function(){
    $(".nav-link").each(function(){
        var s=$(this)
        if(s.prop('href') === window.location.href){
            s.addClass('active');
        }
    });
});