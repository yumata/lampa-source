import Storage from './storage'

function init(){
    let timer

    $(window).on('resize', ()=>{
        clearTimeout(timer)
        
        timer = setTimeout(update,100)
    })

    toggleClasses()

    Storage.listener.follow('change', (event)=>{
        if(event.name == 'interface_size') update()
        if(event.name == 'animation' || event.name == 'mask') toggleClasses()
    })

    let body = $('body')
    let mouse_timer

    $(window).on('mousemove',()=>{
        clearTimeout(mouse_timer)

        mouse_timer = setTimeout(()=>{
            //body.toggleClass('no--cursor',true)
        },3000)

        body.toggleClass('no--cursor',false)
    })
}

function size(){
    let sl = Storage.field('interface_size')
    let sz = {
        normal: 1,
        small: 0.9,
        bigger: 1.1
    }

    let fs = sz[sl]

    $('body').css({
        fontSize: Math.max(window.innerWidth / 84.17 * fs, 10.6) + 'px'
    }).removeClass('size--small size--normal size--bigger').addClass('size--'+sl)
}

function update(){
    size()

    let wrap = $('.wrap__left')

    if(!wrap.length) return

    let left = wrap[0].getBoundingClientRect()

    $('.layer--width').css('width',window.innerWidth - (Storage.field('light_version') && window.innerWidth >= 767 ? left.width : 0))

    let head = $('.head')[0].getBoundingClientRect()

    $('.layer--wheight').each(function(){
        let elem = $(this),
            heig = window.innerHeight - head.height

        if(elem.data('mheight')){
            heig -= elem.data('mheight')[0].getBoundingClientRect().height
        }

        elem.css('height', heig)
    })

    $('.layer--height').each(function(){
        let elem = $(this),
            heig = window.innerHeight

        if(elem.data('mheight')){
            heig -= elem.data('mheight')[0].getBoundingClientRect().height
        }

        elem.css('height', heig)
    })
}

function toggleClasses(){
    $('body').toggleClass('no--animation', !Storage.field('animation'))
    $('body').toggleClass('no--mask', !Storage.field('mask'))
}

export default {
    update,
    init
}