import Storage from './storage/storage'
import Platform from './platform'
import Utils from '../utils/utils'
import Background from '../interaction/background'

let timer
let need_update = false
let need_visible = false

function init(){
    window.screen_width  = window.innerWidth
    window.screen_height = window.innerHeight

    $(window).on('resize', ()=>{
        Lampa.Listener.send('resize_start')

        window.screen_width  = window.innerWidth
        window.screen_height = window.innerHeight

        clearTimeout(timer)
        
        timer = setTimeout(()=>{
            toggleMobile()
            toggleOrientation()

            size()

            update()

            Lampa.Listener.send('resize_end')
        },100)
    })

    let follow = [
        'animation',
        'mask',
        'card_interfice_poster',
        'glass_style',
        'black_style',
        'glass_opacity',
        'card_interfice_cover',
        'advanced_animation',
        'light_version',
        'keyboard_type'
    ]


    Storage.listener.follow('change', (event)=>{
        if(event.name == 'interface_size'){
            size()
            update()
        }

        if(follow.indexOf(event.name) >= 0) toggleClasses(), update()
    })
    
    toggleClasses()
    toggleMobile()
    toggleOrientation()

    size()

    setTimeout(blick, 5000)

    if(Platform.tv() || Platform.desktop()) mouseEvents()
}

function toggleMobile(){
    $('body').toggleClass('true--mobile', Platform.screen('mobile'))
}

function toggleOrientation(){
    $('body').removeClass('orientation--portrait orientation--landscape').addClass('orientation--'+(window.innerWidth > window.innerHeight && window.innerHeight < 768 ? 'landscape' : 'portrait'))
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
        bigger: 1.05
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

    let landscape = window.innerWidth > window.innerHeight && window.innerHeight < 768

    let wrap = document.querySelector('.wrap__left')
    let head = document.querySelector('.head')
    let navi = document.querySelector('.navigation-bar')

    let menu_left   = wrap ? wrap.getBoundingClientRect().left : 0
    let menu_width  = wrap ? wrap.getBoundingClientRect().width : 0
    let head_height = head ? head.getBoundingClientRect().height : 0
    let navi_height = navi && !landscape ? navi.getBoundingClientRect().height : 0
    let navi_width  = navi && landscape ? navi.getBoundingClientRect().width : 0

    let layer_width   = Array.from(target.querySelectorAll('.layer--width'))
    let layer_height  = Array.from(target.querySelectorAll('.layer--height'))
    let layer_wheight = Array.from(target.querySelectorAll('.layer--wheight'))
    
    if(target.classList.contains('layer--width'))   layer_width.push(target)
    if(target.classList.contains('layer--height'))  layer_height.push(target)
    if(target.classList.contains('layer--wheight')) layer_wheight.push(target)

    for(let i = 0; i < layer_width.length; i++){
        let elem = layer_width[i],
            read = parseFloat(elem.style.width),
            widh = window.innerWidth - (Platform.screen('light') && menu_left == 0 ? menu_width : 0) - navi_width

        if(read !== widh) layer_width[i].style.width = widh
    }

    for(let i = 0; i < layer_wheight.length; i++){
        let elem = layer_wheight[i],
            heig = window.innerHeight - head_height - navi_height,
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

function intersectedGrid(viewCell, elemCell, maxDistance = 2) {
    // разница между экранной ячейкой и ячейкой элемента
    let dx = Math.abs(viewCell.x - elemCell.x)
    let dy = Math.abs(viewCell.y - elemCell.y)

    // если элемент в пределах maxDistance ячеек — показываем
    return dx <= maxDistance && dy <= maxDistance
}

function frameVisible(){
    let cellW = window.innerWidth
    let cellH = window.innerHeight

    // экран всегда "в нулевой ячейке"
    let viewCell = { x: 0, y: 0 }

    if(need_visible){
        let elems = need_visible

        for(let i = 0; i < elems.length; i++){
            let elem = elems[i]

            if(!elem.call_visible){
                elem.bond = elem.getBoundingClientRect()

                // определяем в какую ячейку попадает элемент
                let elemCell = {
                    x: Math.floor(elem.bond.left / cellW),
                    y: Math.floor(elem.bond.top / cellH)
                }

                let inter = intersectedGrid(viewCell, elemCell, 2)

                elem.visible = inter

                let visibility = inter ? 'visible' : 'hidden'

                if(elem.visibility !== visibility){
                    if(!elem.visibility && visibility == 'visible') continue

                    elem.visibility = visibility
                }
            }
        }

        for(let i = 0; i < elems.length; i++){
            let elem = elems[i]

            if(elem.visible && !elem.called_visible){
                elem.called_visible = true

                Utils.trigger(elem, 'visible')
            }

            if(elem.visibility && elem.style.visibility !== elem.visibility){
                elem.style.visibility = elem.visibility

                Utils.trigger(elem, 'visible:change')
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
    $('body').toggleClass('card--no-cover', !Storage.field('card_interfice_cover'))
    $('body').toggleClass('advanced--animation', Storage.field('advanced_animation'))
    $('body').toggleClass('light--version',Storage.field('light_version'))
    $('body').toggleClass('system--keyboard',Storage.field('keyboard_type') == 'lampa' ? false : true)

    $('body').removeClass('glass--style-opacity--easy glass--style-opacity--medium glass--style-opacity--blacked')
    
    if(Storage.field('glass_style')) $('body').addClass('glass--style-opacity--'+Storage.field('glass_opacity'))

    Background.theme(Storage.field('black_style') ? 'black' : 'reset')
}

function combineElements(find_class, elements, combine){
    let target = combine instanceof jQuery ? combine[0] : combine
    let elems  = []

    if(target.classList.contains(find_class)){
        elems.push(target)
    }

    elems = elems.concat(
        Array.from(target.querySelectorAll('.' + find_class))
    )

    elems.filter(elem=>elements.indexOf(elem) < 0)

    return [].concat(elements, elems)
}

function visible(where){
    let active  = Lampa.Activity.active()
    let combine = where ? where : active && active.activity ? active.activity.render(true) : false

    if(!combine) return

    need_visible = combineElements('layer--visible', need_visible || [], combine)

    updateFrame()   
}

function update(where){
    need_update = where

    updateFrame()
}

function updateFrame() {
    if(need_update !== false) frameUpdate(need_update)
    if(need_visible !== false) frameVisible()

    need_update = false
    need_visible = false
}

export default {
    update,
    visible,
    init
}