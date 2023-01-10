import Storage from './storage'
import Platform from './platform'
import Utils from './math'
import Lang from '../utils/lang'
import Modal from '../interaction/modal'

let timer
let need_update = false
let need_visible = false
let canianimate = typeof requestAnimationFrame !== 'undefined'

function init(){
    $(window).on('resize', ()=>{
        clearTimeout(timer)
        
        timer = setTimeout(()=>{
            size()
            update()
        },100)
    })


    Storage.listener.follow('change', (event)=>{
        if(event.name == 'interface_size'){
            size()
            update()
        }
        if(event.name == 'animation' || event.name == 'mask' || event.name == 'card_interfice_poster' || event.name == 'glass_style' || event.name == 'black_style') toggleClasses()
    })

    
    toggleClasses()

    inputDetected()

    size()
    blick()

    if(Platform.tv() || Platform.desktop()) mouseEvents()
}

function inputDetected(){
    let controller_enabled = 'content'

    let show_touch, show_mouse

    let close = ()=>{
        Lampa.Modal.close()

        Lampa.Controller.toggle(controller_enabled)
    }

    $(document).on('touchstart',()=>{
        if($('.modal').length || show_touch) return

        controller_enabled = Lampa.Controller.enabled().name

        if(!Storage.get('is_true_mobile','false') && Platform.screen('tv')){
            show_touch = true
            
            Lampa.Modal.open({
                title: '',
                align: 'center',
                zIndex: 300,
                html: $('<div class="about">'+Lang.translate('input_detection_touch')+'</div>'),
                buttons: [
                    {
                        name: Lang.translate('settings_param_no'),
                        onSelect: close
                    },
                    {
                        name: Lang.translate('settings_param_yes'),
                        onSelect: ()=>{
                            Storage.set('is_true_mobile','true')

                            window.location.reload()
                        }
                    }
                ]
            })
        }
    }).on('click',()=>{
        if($('.modal').length || show_mouse) return

        controller_enabled = Lampa.Controller.enabled().name

        if(Storage.field('navigation_type') !== 'mouse' && Platform.screen('tv')){
            show_mouse = true

            Lampa.Modal.open({
                title: '',
                align: 'center',
                zIndex: 300,
                html: $('<div class="about">'+Lang.translate('input_detection_mouse')+'</div>'),
                buttons: [
                    {
                        name: Lang.translate('settings_param_no'),
                        onSelect: close
                    },
                    {
                        name: Lang.translate('settings_param_yes'),
                        onSelect: ()=>{
                            Storage.set('navigation_type','mouse')

                            window.location.reload()
                        }
                    }
                ]
            })
        }
    })
}

function mouseEvents(){
    let body = $('body')

    let mouse_timer_cursor
    
    $(window).on('mousemove',()=>{
        clearTimeout(mouse_timer_cursor)

        mouse_timer_cursor = setTimeout(()=>{
            body.toggleClass('no--cursor',true)
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

function frameUpdate(render){
    let where  = render || document.body
    let target = where instanceof jQuery ? where[0] : where

    let wrap = document.querySelector('.wrap__left')
    let head = document.querySelector('.head')

    let menu_width  = wrap ? wrap.getBoundingClientRect().width : 0
    let head_height = head ? head.getBoundingClientRect().height : 0

    let layer_width   = Array.from(target.querySelectorAll('.layer--width'))
    let layer_height  = Array.from(target.querySelectorAll('.layer--height'))
    let layer_wheight = Array.from(target.querySelectorAll('.layer--wheight'))
    
    if(target.classList.contains('layer--width'))   layer_width.push(target)
    if(target.classList.contains('layer--height'))  layer_height.push(target)
    if(target.classList.contains('layer--wheight')) layer_wheight.push(target)

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

function frameVisible(render){
    let active = Lampa.Activity.active()
    let where  = render ? render : active && active.activity ? active.activity.render() : false
    let area   = 1.5
    let v_w    = window.innerWidth * area
    let v_h    = window.innerHeight * area
    let m_w    = window.innerWidth - v_w
    let m_h    = window.innerHeight - v_h

    if(where){
        let target = where instanceof jQuery ? where[0] : where
        let elems  = []

        if(target.classList.contains('layer--visible')){
            elems.push({
                type: 'visible',
                elem: target
            })
        }

        if(target.classList.contains('layer--render')){
            elems.push({
                type: 'render',
                elem: target
            })
        }

        elems = elems.concat(
            Array.from(target.querySelectorAll('.layer--visible')).map(elem=>{return {type: 'visible',elem:elem}}),
            Array.from(target.querySelectorAll('.layer--render')).map(elem=>{return {type: 'render',elem:elem}})
        )

        for(let i = 0; i < elems.length; i++){
            let item = elems[i]
            let elem = item.elem

            if(item.type == 'visible'){
                if(!elem.call_visible){
                    let bond = elem.getBoundingClientRect()

                    if(intersected(
                        [m_w, m_h, v_w, v_h],
                        [bond.left, bond.top, bond.left + bond.width, bond.top + bond.height]
                    )){
                        elem.call_visible = true

                        item.visible = true
                    }
                }
            }
            else if(elem.call_visible){
                let bond = elem.getBoundingClientRect()
                let view = intersected(
                    [m_w, m_h, v_w, v_h],
                    [bond.left, bond.top, bond.left + bond.width, bond.top + bond.height]
                )

                let visibility = view ? 'visible' : 'hidden'

                if(elem.visibility !== visibility){
                    if(!elem.visibility && visibility == 'visible') continue

                    elem.visibility = visibility

                    item.visibility = visibility
                }
            }
        }

        for(let i = 0; i < elems.length; i++){
            let item = elems[i]
            let elem = item.elem

            if(item.type == 'visible'){
                if(item.visible) Utils.trigger(elem, 'visible')
            }
            else{
                if(item.visibility) elem.style.visibility = item.visibility
            }
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

function visible(where){
    requestFrame()

    need_visible = where

    if(!canianimate) frameVisible(where)
}

function update(where){
    requestFrame()

    need_update = where

    if(!canianimate) frameUpdate(where)
}

function requestFrame(){
    if(canianimate && need_update === false && need_visible === false) requestAnimationFrame(updateFrame)
}

function updateFrame() {
    if(need_update !== false) frameUpdate(need_update)
    if(need_visible !== false) frameVisible(need_visible)

    need_update = false
    need_visible = false
}

export default {
    update,
    visible,
    init
}