import Subscribe from '../utils/subscribe'
import Activity from './activity'
import Storage from '../utils/storage'
import Screensaver from './screensaver'
import Utils from '../utils/math'

let listener = Subscribe()

let active
let active_name     = ''

let controlls   = {}

let selects
let select_active

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
        select_active.trigger('hover:enter')
    }
}

/**
 * Вызов long
 */
 function long(){
    if(active && active.long) run('long')
	else if(select_active){
        select_active.trigger('hover:long')
    }
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

        //updateSelects()

        listener.send('toggle',{name: name})
    }
}

function bindMouseOrTouch(name){
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
    selects = cuctom || $('.selector')

    selects.unbind('.hover')

    if(Storage.field('navigation_type') == 'mouse'){
        selects.on('click.hover', function(e){
            let time = $(this).data('click-time') || 0

            //ну хз, 2 раза клик срабатывает, нашел такое решение:
            if(time + 100 < Date.now()){
                selects.removeClass('focus enter')

                if(e.keyCode !== 13) $(this).addClass('focus').trigger('hover:enter', [true])
            }
            
            $(this).data('click-time', Date.now()) 
        })
        
        bindMouseOrTouch('mouseenter')

        bindMouseAndTouchLong()
    }

    bindMouseOrTouch('touchstart')
}

function enable(name){
    if(active_name == name) toggle(name)
}

function clearSelects(){
    select_active = false

    if(selects) selects.removeClass('focus enter')

    //if(selects) selects.unbind('.hover')
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
 * Фокус на элементе
 * @param {Object} target 
 */
function focus(target){
    if(selects) selects.removeClass('focus enter').data('ismouse',false)

    $(target).addClass('focus').trigger('hover:focus')

    select_active = $(target)
}

function collectionSet(html, append){
    let selectors = html.find('.selector')
    let colection = selectors.toArray()

    if(append){
        selectors = $.merge(selectors, append.find('.selector'))
        colection = colection.concat(append.find('.selector').toArray())
    }

    if(colection.length || active.invisible){
        clearSelects()

        Navigator.setCollection(colection)

        updateSelects(selectors)
    } 
}

function collectionAppend(append){
    let old_selects = selects

    updateSelects(append)

    append.each(function(){
        Navigator.add($(this)[0])
    })
    
    selects = $.merge(selects, old_selects)
}

function collectionFocus(target, html){
    if(target){
        Navigator.focus(target)
    }
    else{
        let colection = html.find('.selector').not('.hide').toArray()

        if(colection.length) Navigator.focus(colection[0])
    }
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
    toContent
}