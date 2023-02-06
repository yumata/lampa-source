import Keypad from "../interaction/keypad"
import Lang from '../utils/lang'
import Modal from '../interaction/modal'
import Controller from '../interaction/controller'
import Storage from './storage'
import Platform from './platform'
import Noty from '../interaction/noty'

let keydown_time = 0
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

    detect()
}

function showModal(text, onselect){
    let controller = Controller.enabled().name

    Modal.open({
        title: '',
        align: 'center',
        zIndex: 300,
        html: $('<div class="about">'+text+'</div>'),
        buttons: [
            {
                name: Lang.translate('settings_param_no'),
                onSelect: ()=>{
                    Modal.close()

                    Controller.toggle(controller)
                }
            },
            {
                name: Lang.translate('settings_param_yes'),
                onSelect: onselect
            }
        ]
    })
}

function detect(){
    let show_touch, show_mouse, show_remote

    $(document).on('touchstart',(e)=>{
        if($('.modal').length || show_touch) return

        if(!Storage.get('is_true_mobile','false') && Platform.screen('tv')){
            show_touch = true

            showModal(Lang.translate('input_detection_touch'),()=>{
                Storage.set('is_true_mobile','true')

                window.location.reload()
            })
        }
    }).on('click',(e)=>{
        if($('.modal').length || show_mouse || !canClick(e.originalEvent)) return

        if(Storage.field('navigation_type') !== 'mouse' && Platform.screen('tv')){
            show_mouse = true

            showModal(Lang.translate('input_detection_mouse'),()=>{
                Storage.set('navigation_type','mouse')

                window.location.reload()
            })
        }
    })

    Keypad.listener.follow('keydown',()=>{
        if($('.modal').length || show_remote || document.activeElement.tagName == 'INPUT') return

        if(Storage.get('is_true_mobile','false') && Platform.screen('tv')){
            show_remote = true

            showModal(Lang.translate('input_detection_remote'),()=>{
                Storage.set('is_true_mobile','false')

                window.location.reload()
            })
        }
    })
}

function canClick(e){
    //Noty.show('pointerType: ' + e.pointerType + '; type: ' + e.type + '; isTrusted: ' + e.isTrusted)

    if(e && e.custom_trigger) return true

	return Date.now() - keydown_time < 500 ? false : touch || Platform.is('browser') || Platform.tv() || Platform.desktop() || (Date.now() - move_time < 500) 
}

export default {
    init,
    canClick
}