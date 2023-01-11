import Keypad from "../interaction/keypad"
import Lang from '../utils/lang'
import Modal from '../interaction/modal'
import Controller from '../interaction/controller'
import Storage from './storage'
import Platform from './platform'

let keydown_time = 0
let move_time = 0
let touch = false

function init(){
    Keypad.listener.follow('keydown',()=>{
        keydown_time = Date.now()
        move_time    = 0
    })

    $(window).on('mousemove',()=>{
        move_time = Date.now()
    }).on('touchstart',()=>{
        touch = true
    })

    detect()
}

function detect(){
    let controller_enabled = 'content'

    let show_touch, show_mouse

    let close = ()=>{
        Modal.close()

        Controller.toggle(controller_enabled)
    }

    $(document).on('touchstart',()=>{
        if($('.modal').length || show_touch) return

        controller_enabled = Controller.enabled().name

        if(!Storage.get('is_true_mobile','false') && Platform.screen('tv')){
            show_touch = true
            
            Modal.open({
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
        if($('.modal').length || show_mouse || !canClick()) return

        controller_enabled = Controller.enabled().name

        if(Storage.field('navigation_type') !== 'mouse' && Platform.screen('tv')){
            show_mouse = true

            Modal.open({
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

function canClick(){
	return Date.now() - keydown_time < 500 ? false : touch || Platform.is('browser') || (Date.now() - move_time < 500) 
}

export default {
    init,
    canClick
}