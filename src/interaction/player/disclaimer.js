import Storage from '../../core/storage/storage'
import Platform from '../../core/platform'
import Settings from '../settings/settings'
import Controller from '../../core/controller'
import Modal from '../modal'
import Lang from '../../core/lang'
import Player from '../player'

let wait_for_disclaimer = false
let show_disclaimer = false

function init(){
    Player.listener.follow('destroy', reset)
}

function needs(player_need, launch_player){
    return (Storage.field(player_need) == 'inner' || launch_player == 'inner') && Platform.is('apple_tv') && !show_disclaimer
}

function show(call){
    wait_for_disclaimer = true
    show_disclaimer = true

    function openPlayerSettingSidebar(){
        let openPlayer = (event)=>{
            if(event.name !== 'player') return

            Settings.listener.remove('open', openPlayer)

            if(!Controller.enabled() || Controller.enabled().name !== 'settings_component'){
                Controller.toggle('settings_component')
            }

            let player_field = event.body.find('[data-name="player"]')

            if(player_field.length) player_field.trigger('hover:enter')
        }

        Settings.listener.follow('open', openPlayer)

        Controller.toggle('settings')
        Settings.create('player')
    }

    Modal.open({
        title: Lang.translate('inner_player_disclaimer_title'),
        size: 'small',
        scroll: {
            nopadding: true
        },
        html: $('<div class="about">' + Lang.translate('inner_player_disclaimer_text') + '</div>'),
        buttons: [
            {
                name: Lang.translate('confirm'),
                onSelect: ()=>{
                    wait_for_disclaimer = false
                    Modal.close()
                    call()
                }
            },
            {
                name: Lang.translate('inner_player_disclaimer_change_player'),
                onSelect: ()=>{
                    wait_for_disclaimer = false
                    Modal.close()
                    openPlayerSettingSidebar()
                }
            }
        ],
        onBack: ()=>{
            wait_for_disclaimer = false
            Modal.close()
        }
    })
}

function reset(){
    wait_for_disclaimer = false
}

function isWaiting(){
    return wait_for_disclaimer
}

export default {
    init,
    needs,
    show,
    reset,
    isWaiting
}
