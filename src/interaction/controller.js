import Subscribe from '../utils/subscribe'
import Activity from './activity'
import Storage from '../utils/storage'
import Screensaver from './screensaver'
import Utils from '../utils/math'
import Layer from '../utils/layer'
import Arrays from '../utils/arrays'

let listener = Subscribe()

let active
let active_name     = ''

let controlls   = {}

let selects
let select_active

function observe(){
    let observer = new MutationObserver((mutations)=>{
        for(let i = 0; i < mutations.length; i++){
            let mutation = mutations[i]

            //console.log(mutation)

            if(mutation.type == 'childList'){
                let selectors = Array.from(mutation.target.querySelectorAll('.selector'))

                selectors.forEach(elem=>{
                    bindEvents(elem)
                })
                /*
                bindEvents(mutation.target)

                let children = mutation.target.children

                for(let c = 0; c < children.length; c++){
                    bindEvents(children[c])
                }
                */
            }
        }
    })

    observer.observe(document, {
        childList: true,
        subtree: true
    })
}

/**
 * Добавить контроллер
 * @param {String} name 
 * @param {Object} calls 
 */
function add(name, calls){
    controlls[name] = calls
}

/**
 * Запустить функцию
 * @param {String} name 
 * @param {Object} params 
 */
function run(name,params){
    if(active){
        if(active[name]){
            if(typeof active[name] == 'function') active[name](params);
            else if(typeof active[name] == 'string'){
                run(active[name],params)
            }
        }
    }
}

/**
 * Двигать
 * @param {String} direction 
 */
function move(direction){
    run(direction)
}

/**
 * Вызов enter
 */
function enter(){
    if(active && active.enter) run('enter')
	else if(select_active) Utils.trigger(select_active, 'hover:enter')
}

/**
 * Вызов long
 */
 function long(){
    if(active && active.long) run('long')
	else if(select_active) Utils.trigger(select_active, 'hover:long')
}

/**
 * Завершить
 */
function finish(){
    run('finish')
}

/**
 * Нажали назад
 */
function back(){
    run('back')
}

/**
 * Переключить контроллер
 * @param {String} name 
 */
function toggle(name){
    if(active && active.gone) active.gone(name)

    if(controlls[name]){
        active      = controlls[name]
        active_name = name
        
        Activity.call(()=>{
            run('back')
        })

        if(active.toggle) active.toggle()

        if(active.update) active.update()
        else{
            Layer.update()
        }

        listener.send('toggle',{name: name})
    }
}

function bindEvents(elem){
    if(elem.classList.contains('selector') && !elem.trigger_click){
        elem.trigger_click = ()=>{
            Utils.trigger(elem, 'hover:enter')
        }

        elem.trigger_mouseenter = ()=>{
            elem.classList.add('hover')

            Utils.trigger(elem, 'hover:hover')
        }
        
        elem.trigger_mouseleave = ()=>{
            elem.classList.remove('hover')
        }

        elem.addEventListener('click', elem.trigger_click)
        elem.addEventListener('mouseenter', elem.trigger_mouseenter)
        elem.addEventListener('mouseleave', elem.trigger_mouseleave)
    }
}

function bindMouseOrTouch(name){
    let trigger_name = 'trigger_'+name

    selects.forEach(elem=>{
        if(!elem[trigger_name]){
            elem[trigger_name] = ()=>{
                removeClass(['hover'])

                elem.classList.add('hover')
            }

            elem.addEventListener(name, elem[trigger_name])
        }
    })
    /*
    selects.on(name+'.hover', function(e){
        if($(this).hasClass('selector')){
            if(name == 'touchstart') $('.selector').removeClass('focus enter')

            selects.removeClass('focus enter').data('ismouse',false)

            $(this).addClass('focus').data('ismouse',true).trigger('hover:focus', [true])

            let silent = Navigator.silent

            Navigator.silent = true
            Navigator.focus($(this)[0])
            Navigator.silent = silent
        }
    })

    if(name == 'mouseenter') selects.on('mouseleave.hover',function(){
        $(this).removeClass('focus')
    })
    */
}

function bindMouseAndTouchLong(){
    selects.each(function(){
        let selector = $(this)
        let position = 0
        let timer

        let trigger = function(){
            clearTimeout(timer)

            timer = setTimeout(()=>{
                let time = selector.data('long-time') || 0

                if(time + 100 < Date.now()){
                    let mutation = Math.abs(position - (selector.offset().top + selector.offset().left))

                    if(mutation < 30) selector.trigger('hover:long', [true])
                }

                selector.data('long-time', Date.now())
            },800)

            position = selector.offset().top + selector.offset().left
        }

        selector.on('mousedown.hover touchstart.hover',trigger).on('mouseout.hover mouseup.hover touchend.hover touchmove.hover',(e)=>{
            clearTimeout(timer)
        })
    })
}


function updateSelects(cuctom){
    if(cuctom) selects = cuctom

    return

    if(Storage.field('navigation_type') == 'mouse'){
        selects.forEach(elem=>{
            if(!elem.trigger_click){
                elem.trigger_click = ()=>{
                    Utils.trigger(elem, 'hover:enter')
                }

                elem.trigger_mouseenter = ()=>{
                    elem.classList.add('hover')
                }
                
                elem.trigger_mouseleave = ()=>{
                    elem.classList.remove('hover')
                }

                elem.addEventListener('click', elem.trigger_click)
                elem.addEventListener('mouseenter', elem.trigger_mouseenter)
                elem.addEventListener('mouseleave', elem.trigger_mouseleave)
            }
        })
        
        //bindMouseOrTouch('mouseenter')

        //bindMouseAndTouchLong()
    }

    if(Utils.isTouchDevice()) bindMouseOrTouch('touchstart')
}

function enable(name){
    if(active_name == name) toggle(name)
}

function clearSelects(){
    select_active = false

    removeClass(['focus'])
}

/**
 * Вызвать событие
 * @param {String} name 
 * @param {Object} params 
 */
function trigger(name,params){
    run(name, params)
}

function removeClass(classes){
    if(selects){
        selects.forEach(element => {
            classes.forEach(class_name=>{
                element.classList.remove(class_name)
            })
        })
    }
}

/**
 * Фокус на элементе
 * @param {Object} target 
 */
function focus(target){
    removeClass(['focus'])

    target.classList.add('focus')

    Utils.trigger(target, 'hover:focus')

    select_active = target
}

function collectionSet(html, append){
    html   = html instanceof jQuery ? html[0] : html
    append = append instanceof jQuery ? append[0] : append

    let colection = Array.from(html.querySelectorAll('.selector'))

    if(append){
        colection = colection.concat(Array.from(append.querySelectorAll('.selector')))
    }

    if(colection.length || active.invisible){
        clearSelects()

        Navigator.setCollection(colection)

        updateSelects(colection)
    } 
}

function collectionAppend(append){
    append = append instanceof jQuery ? append.toArray() : append

    if(!append.length) append = Array.from([append])
    
    let old = selects

    updateSelects(append)

    Navigator.multiAdd(append)

    append.forEach(elem=>{
        Arrays.remove(old,elem)
    })

    if(old.length) selects = old.concat(append)
}

function collectionFocus(target, html){
    html = html instanceof jQuery ? html[0] : html
    target = target instanceof jQuery ? target[0] : target

    if(target && target.offsetParent === null) target = false

    if(target){
        Navigator.focus(target)
    }
    else{
        let colection = Array.from(html.querySelectorAll('.selector')).filter(elem=>!elem.classList.contains('hide'))

        if(colection.length) Navigator.focus(colection[0])
    }
}

function own(link){
    return active && active.link == link
}

function enabled(){
    return {
        name: active_name,
        controller: active
    }
}

function toContent(){
    let trys = 0

    Screensaver.stopSlideshow()

    let go = ()=>{
        let contrl = enabled()

        let any = parseInt([
            $('body').hasClass('settings--open') ? 1 : 0,
            $('body').hasClass('selectbox--open') ? 1 : 0,
            $('.modal,.youtube-player,.player,.search-box,.search').length ? 1 : 0,
        ].join(''))

        trys++

        if(any){
            if(contrl.controller.back) contrl.controller.back()
            
            if(trys < 10) go()
        }
    }

    go()
}

export default {
    listener,
    observe,
    add,
    move,
    enter,
    finish,
    toggle,
    trigger,
    back,
    focus,
    collectionSet,
    collectionFocus,
    collectionAppend,
    enable,
    enabled,
    long,
    updateSelects,
    toContent,
    own
}