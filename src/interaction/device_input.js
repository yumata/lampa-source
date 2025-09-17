import Keypad from "../core/keypad"
import Controller from '../core/controller'
import Storage from '../core/storage/storage'
import Platform from '../core/platform'

let keydown_time = 0
let duble_click_time = 0
let move_time = 0
let touch = false

function init(){
    Keypad.listener.follow('keydown',()=>{
        keydown_time = Date.now()
        move_time    = 0
    })

    $(window).on('mousemove',(e)=>{
        move_time = Date.now()
    }).on('touchstart',()=>{
        touch = true
    })

    Storage.listener.follow('change', (e)=>{
        if(e.name == 'navigation_type'){
            Storage.set('is_true_mobile', Boolean(e.value == 'touch'), true)

            Controller.toContent()

            window.location.reload()
        }
    })
}

function canClick(e){
    if(e && e.custom_trigger) return true

	return Date.now() - keydown_time < 500 ? false : touch || Platform.is('browser') || Platform.tv() || Platform.desktop() || (Date.now() - move_time < 500) 
}

function noDubleClick(e){
    if(Date.now() - duble_click_time < 500){
        e.preventDefault()
        e.stopPropagation()

        return false
    }

    duble_click_time = Date.now()

    return true
}

export default {
    init,
    canClick,
    noDubleClick
}