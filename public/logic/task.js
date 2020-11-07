$('.edit').on('click',function(event){
    const btn=$(this);
    btn.addClass('hid');
    const btn2=btn.next('.myc');
    btn2.removeClass('hid');
    btn2.addClass('on');
    const form=$(this).closest('form');
    const task=form.find('.a');
    task.removeClass('hid');
    task.addClass('on');
    const h=form.find('.task');
    h.addClass('hid');
});