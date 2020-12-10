var animation=bodymovin.loadAnimation({
    container: document.getElementById('ticking'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../assets/ticking.json'
})

anime({
    targets: '.verticalslide li',
    keyframes:[
        {translateY:-50,opacity:0,duration:0},
        {translateY:0,opacity:1, duration:500},
        {translateY:50,opacity:0,delay:2000,duration:500}
    ],
    easing:'linear',
    delay: anime.stagger(2500,{start:0}),
    loop:true
});