import Subscribe from '../utils/subscribe'
import Activity from './activity'

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
    //console.log('Contoller','toggle of [',active_name,'] to [',name,']')

    if(active && active.gone) active.gone(name)

    if(controlls[name]){
        active      = controlls[name]
        active_name = name
        
        Activity.call(()=>{
            run('back')
        })

        if(active.toggle) active.toggle()

        selects = $('.selector')

        /*
        selects.on('click.hover', function(e){
			selects.removeClass('focus enter')

			if(e.keyCode !== 13) $(this).addClass('focus').trigger('hover:enter', [true])
		}).on('mouseover.hover', function(e){
            if($(this).hasClass('selector')){
                let cotr = $(this).data('controller')

                console.log(cotr)
                
                if(name !== cotr && cotr){
                    console.log(name, cotr)

                    toggle(cotr)
                }

                selects.removeClass('focus enter').data('ismouse',false)

                $(this).addClass('focus').data('ismouse',true).trigger('hover:focus', [true])
            }
		})
        */

        listener.send('toggle',{name: name})
    }
}

function enable(name){
    if(active_name == name) toggle(name)
}

function clearSelects(){
    select_active = false

    $('.selector').removeClass('focus enter')

    if(selects) selects.unbind('.hover')
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
    let colection = html.find('.selector').toArray()

    if(append){
        colection = colection.concat(append.find('.selector').toArray())
    }

    if(colection.length || active.invisible){
        clearSelects()

        //$(colection).data('controller', enabled().name)

        Navigator.setCollection(colection)
    } 
}

function collectionFocus(target, html){
    if(target){
        Navigator.focus(target)
    }
    else{
        let colection = html.find('.selector').toArray()

        if(colection.length) Navigator.focus(colection[0])
    }
}

function enabled(){
    return {
        name: active_name,
        controller: active
    }
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
    enable,
    enabled,
    long
}