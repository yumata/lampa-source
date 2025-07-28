import Subscribe from '../utils/subscribe'
import Activity from './activity'
import Storage from '../utils/storage'
import Screensaver from './screensaver'
import Utils from '../utils/math'
import Layer from '../utils/layer'
import Platform from '../utils/platform'
import Noty from './noty'
import Keypad from './keypad'
import DeviceInput from '../utils/device_input'
import Sound from '../utils/sound'
import Select from './select'
import Modal from './modal'
import Player from './player'
import Search from './search_global'

let listener = Subscribe()

let active
let active_name = ''
let controlls = {}
let select_active
let try_close = false

function observe(){
    if(typeof MutationObserver == 'undefined') return

    let observer = new MutationObserver((mutations)=>{
        for(let i = 0; i < mutations.length; i++){
            let mutation = mutations[i]

            if(mutation.type == 'childList' && !mutation.removedNodes.length){
                let selectors = Array.from(mutation.target.querySelectorAll('.selector'))

                selectors.forEach(elem=>{
                    if(!elem.classList.contains('hg-button')) bindEvents(elem)
                })
            }
        }
    })

    observer.observe(document, {
        childList: true,
        subtree: true
    })
}

function animateTriggerEnter(elem){
    if(Storage.field('advanced_animation')){
        elem.addClass('animate-trigger-enter')

        setTimeout(()=>{
            elem.removeClass('animate-trigger-enter')
        },500)
    }
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
	else if(select_active){
        animateTriggerEnter(select_active)

        Utils.trigger(select_active, 'hover:enter')
    }
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
        if(name == 'content') toContent()
        
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

        let touchStart = ()=>{
            longStart()

            Utils.trigger(elem, 'hover:touch')
        }

        let rightClick = (e)=>{
            Utils.trigger(elem, 'hover:long')
        }

        elem.trigger_click = (e)=>{
            if(Storage.field('navigation_type') == 'mouse' || Platform.screen('mobile')){
                if(DeviceInput.canClick(e)){
                    animateTriggerEnter(elem)

                    Utils.trigger(elem, 'hover:enter')
                }
            }
        }

        elem.trigger_mouseenter = ()=>{
            clearAllFocus()

            elem.classList.add('focus')

            Utils.trigger(elem, 'hover:hover')
        }
        
        elem.trigger_mouseleave = ()=>{
            elem.classList.remove('focus')
        }

        if(Storage.field('navigation_type') == 'mouse' || Platform.screen('mobile')){
            elem.addEventListener('click', elem.trigger_click)
        }

        if(!Utils.isTouchDevice() && Storage.field('navigation_type') == 'mouse'){
            elem.addEventListener('mouseenter', elem.trigger_mouseenter)
            elem.addEventListener('mouseleave', elem.trigger_mouseleave)
            elem.addEventListener('mouseout', longClear)
            elem.addEventListener('mouseup', longClear)
            elem.addEventListener('mousedown', longStart)
            elem.addEventListener('contextmenu', rightClick)
        }

        if(Utils.isTouchDevice()){
            elem.addEventListener('touchstart', touchStart)
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

function collectionSet(html, append = false, visible_only = false){
    html   = html instanceof jQuery ? html[0] : html
    append = append instanceof jQuery ? append[0] : append

    let colection = Array.from(html.querySelectorAll('.selector'))

    if(visible_only) colection = colection.filter(e=>e.offsetParent !== null)

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

function collectionFocus(target, html, visible_only = false){
    html = html instanceof jQuery ? html[0] : html
    target = target instanceof jQuery ? target[0] : target

    if(target && target.offsetParent === null) target = false

    if(target){
        Navigator.focus(target)
    }
    else{
        let colection = Array.from(html.querySelectorAll('.selector')).filter(elem=>!elem.classList.contains('hide'))

        if(visible_only) colection = colection.filter(e=>e.offsetParent !== null)

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
    if(try_close) return

    try_close = true

    let trys = 0

    Screensaver.stopSlideshow()

    let any = ()=>{
        return parseInt([
            $('body').hasClass('settings--open') ? 1 : 0,
            $('body').hasClass('selectbox--open') ? 1 : 0,
            $('.modal,.youtube-player,.player,.search-box,.search').length ? 1 : 0,
        ].join(''))
    }

    let close = ()=>{
        let contrl = enabled()

        trys++

        if(any()){
            try{
                if(contrl.controller.back) contrl.controller.back()
            }
            catch(e){}
            
            if(trys < 10) close()
        }
    }

    let remove = ()=>{
        try{
            if($('body').hasClass('settings--open')) $('body').removeClass('settings--open')

            if($('body').hasClass('selectbox--open')) Select.close()

            if($('.modal').length) Modal.close()

            if($('.player').length) Player.close()

            if($('.search-box').length) $('.search-box').remove()

            if($('body').hasClass('search--open')) Search.close()

            $('body').removeClass('ambience--enable')
        }
        catch(e){}
    }

    close()
    remove()

    try_close = false
}

function clear(){
    clearSelects()

    Navigator.setCollection([])
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
    own,
    clear
}