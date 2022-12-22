import Subscribe from '../utils/subscribe'
import Activity from './activity'
import Storage from '../utils/storage'
import Screensaver from './screensaver'
import Utils from '../utils/math'
import Layer from '../utils/layer'
import Platform from '../utils/platform'

let listener = Subscribe()

let active
let active_name = ''
let controlls = {}
let select_active

function observe(){
    let observer = new MutationObserver((mutations)=>{
        if(Storage.field('navigation_type') == 'mouse'){
            for(let i = 0; i < mutations.length; i++){
                let mutation = mutations[i]

                if(mutation.type == 'childList' && !mutation.removedNodes.length){
                    let selectors = Array.from(mutation.target.querySelectorAll('.selector'))

                    selectors.forEach(elem=>{
                        if(!elem.classList.contains('hg-button')) bindEvents(elem)
                    })
                }
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
    if(elem.classList.contains('selector') && !elem.bind_events){
        elem.bind_events = true

        let long_position = 0
        let long_timer

        let longStart = ()=>{
            clearTimeout(long_timer)

            let offset = elem.getBoundingClientRect()

            long_timer = setTimeout(()=>{
                let time = elem.long_time || 0

                offset = elem.getBoundingClientRect()

                if(time + 100 < Date.now()){
                    let mutation = Math.abs(long_position - (offset.top + offset.left))

                    if(mutation < 30) Utils.trigger(elem, 'hover:long')
                }

                elem.long_time = Date.now()
            },800)

            long_position = offset.top + offset.left
        }

        let longClear = ()=>{
            clearTimeout(long_timer)
        }

        elem.trigger_click = (e)=>{
            console.log('Click', e.keyCode)
            Utils.trigger(elem, 'hover:enter')
        }

        elem.trigger_mouseenter = ()=>{
            clearAllFocus()

            elem.classList.add('focus')

            Utils.trigger(elem, 'hover:hover')
        }
        
        elem.trigger_mouseleave = ()=>{
            elem.classList.remove('focus')
        }

        elem.addEventListener('click', elem.trigger_click)

        if(!Utils.isTouchDevice()){
            elem.addEventListener('mouseenter', elem.trigger_mouseenter)
            elem.addEventListener('mouseleave', elem.trigger_mouseleave)
            elem.addEventListener('mouseout', longClear)
            elem.addEventListener('mouseup', longClear)
            elem.addEventListener('mousedown', longStart)
        }
        else{
            elem.addEventListener('touchstart', longStart)
            elem.addEventListener('touchend', longClear)
            elem.addEventListener('touchmove', longClear)
        }
    }
}

function enable(name){
    if(active_name == name) toggle(name)
}

function clearSelects(){
    select_active = false

    removeClass(['focus'])
}

function clearAllFocus(){
    let collection = Array.from(document.body.querySelectorAll('.selector'))

    collection.forEach(item=>item.classList.remove('focus'))
}

/**
 * Вызвать событие
 * @param {String} name 
 * @param {Object} params 
 */
function trigger(name,params){
    run(name, params)
}

/**
 * Очистить классы
 * @param {Array} classes 
 */
function removeClass(classes){
    if(Navigator._collection){
        Navigator._collection.forEach(element => {
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
    Utils.trigger(target, 'hover:focus')

    if(Platform.screen('tv')){
        removeClass(['focus'])

        target.classList.add('focus')
        
    }

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
    } 
}

function collectionAppend(append){
    append = append instanceof jQuery ? append.toArray() : append

    if(!append.length) append = Array.from([append])

    Navigator.multiAdd(append)
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
    toContent,
    updateSelects: ()=>{},
    own
}