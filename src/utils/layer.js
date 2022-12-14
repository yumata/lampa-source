import Storage from './storage'
import Platform from './platform'
import Utils from './math'

let timer

function init(){
    $(window).on('resize', ()=>{
        clearTimeout(timer)
        
        timer = setTimeout(()=>{
            size()
            update()
        },100)
    })

    toggleClasses()

    Storage.listener.follow('change', (event)=>{
        if(event.name == 'interface_size'){
            size()
            update()
        }
        if(event.name == 'animation' || event.name == 'mask' || event.name == 'card_interfice_poster' || event.name == 'glass_style' || event.name == 'black_style') toggleClasses()
    })

    let body = $('body')
    let mouse_timer

    /*
    $(window).on('mousemove',()=>{
        clearTimeout(mouse_timer)

        mouse_timer = setTimeout(()=>{
            if(typeof nw !== 'undefined') body.toggleClass('no--cursor',true)
        },3000)

        body.toggleClass('no--cursor',false)
    })
    */

    size()
    blick()
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

function blick(){
    $('.icon--blink').not('.ready').each(function(){
        let elem = $(this),
            time = parseInt(elem.data('blink-interval') || 3) * 1000;

        elem.addClass('ready')

        setInterval(()=>{
            elem.addClass('animate')

            setTimeout(()=>{
                elem.removeClass('animate')
            },1000)
        },time)
    })
}

function update(render){
    let where  = render || document.body
    let target = where instanceof jQuery ? where[0] : where

    let wrap = document.querySelector('.wrap__left')
    let head = document.querySelector('.head')

    let menu_width  = wrap ? wrap.getBoundingClientRect().width : 0
    let head_height = head ? head.getBoundingClientRect().height : 0

    let layer_width   = Array.from(target.querySelectorAll('.layer--width'))
    let layer_height  = Array.from(target.querySelectorAll('.layer--height'))
    let layer_wheight = Array.from(target.querySelectorAll('.layer--wheight'))
    
    layer_width.push(target)
    layer_height.push(target)
    layer_wheight.push(target)

    for(let i = 0; i < layer_width.length; i++){
        let elem = layer_width[i],
            read = parseFloat(elem.style.width),
            widh = window.innerWidth - (Platform.screen('light') ? menu_width : 0)

        if(read !== widh) layer_width[i].style.width = widh
    }

    for(let i = 0; i < layer_wheight.length; i++){
        let elem = layer_wheight[i],
            heig = window.innerHeight - head_height,
            attr = elem.mheight,
            read = parseFloat(elem.style.height)

        if(attr){
            heig -= attr.getBoundingClientRect().height
        }

        if(read !== heig) elem.style.height = heig
    }

    for(let i = 0; i < layer_height.length; i++){
        let elem = layer_height[i],
            heig = window.innerHeight,
            attr = elem.mheight,
            read = parseFloat(elem.style.height)

        if(attr){
            heig -= attr.getBoundingClientRect().height
        }

        if(read !== heig) elem.style.height = heig
    }
}

function intersected(a, b) {
    return (a[0] <= b[2] &&
    b[0] <= a[2] &&
    a[1] <= b[3] &&
    b[1] <= a[3])
}

function visible(render){
    let active = Lampa.Activity.active()
    let where  = render ? render : active && active.activity ? active.activity.render() : false
    let area   = 1.5

    if(where){
        let target = where instanceof jQuery ? where[0] : where
        let elems  = Array.from(target.querySelectorAll('.layer--visible'))
            elems.push(target)

        for(let i = 0; i < elems.length; i++){
            let item = elems[i]

            if(!item.call_visible){
                let bond = item.getBoundingClientRect()

                if(intersected(
                    [0, 0, window.innerWidth * area, window.innerHeight * area],
                    [bond.left, bond.top, bond.left + bond.width, bond.top + bond.height]
                )){
                    item.call_visible = true

                    Utils.trigger(item, 'visible')
                }
            }
        }

        elems  = Array.from(target.querySelectorAll('.layer--render'))
        elems.push(target)

        for(let i = 0; i < elems.length; i++){
            let item = elems[i]

            let bond = item.getBoundingClientRect()
            let view = intersected(
                [0, 0, window.innerWidth * area, window.innerHeight * area],
                [bond.left, bond.top, bond.left + bond.width, bond.top + bond.height]
            )

            let visibility = view ? 'visible' : 'hidden'

            if(item.visibility !== visibility){
                if(!item.visibility && visibility == 'visible') continue

                item.visibility = visibility

                item.style.visibility = visibility
            }

            //Utils.trigger(item, 'render')            
        }
    }
}

function toggleClasses(){
    $('body').toggleClass('no--animation', !Storage.field('animation'))
    $('body').toggleClass('no--mask', !Storage.field('mask'))
    $('body').toggleClass('no--poster', !Storage.field('card_interfice_poster'))
    $('body').toggleClass('glass--style', Storage.field('glass_style'))
    $('body').toggleClass('black--style', Storage.field('black_style'))
}

export default {
    update,
    visible,
    init
}