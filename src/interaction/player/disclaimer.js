import Storage from '../../core/storage/storage'
import Platform from '../../core/platform'
import Settings from '../settings/settings'
import Controller from '../../core/controller'
import Modal from '../modal'
import Lang from '../../core/lang'
import Player from '../player'
import Torserver from '../torserver'

let wait_for_disclaimer = false
let show_disclaimer = false
let show_torrent_disclaimer = false

function init(){
    Player.listener.follow('destroy', reset)
}

function needs(player_need, launch_player){
    return (Storage.field(player_need) == 'inner' || launch_player == 'inner') && Platform.is('apple_tv') && !show_disclaimer
}

/**
 * Встроенный плеер для торрентов на Android без транскодирования (gst): WebView воспроизведёт только
 * те форматы и кодеки, которые поддерживает сам. Не запрещаем выбор, а один раз за сессию предупреждаем.
 */
function needsTorrent(player_need, launch_player, data){
    return Platform.is('android') && data && data.torrent_hash && !Torserver.gstWork() &&
        (Storage.field(player_need) == 'inner' || launch_player == 'inner') && Storage.field('player_torrent_gst_warning') && !show_torrent_disclaimer
}

function show(call, player_need, torrent){
    wait_for_disclaimer = true

    if(torrent) show_torrent_disclaimer = true
    else show_disclaimer = true

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

    let buttons = [
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
    ]

    // для торрентов можно отключить предупреждение насовсем (настройка player_torrent_gst_warning)
    if(torrent) buttons.splice(1, 0, {
        name: Lang.translate('inner_player_torrent_disclaimer_dont_ask'),
        onSelect: ()=>{
            Storage.set('player_torrent_gst_warning', 'false')
            wait_for_disclaimer = false
            Modal.close()
            call()
        }
    })

    Modal.open({
        title: Lang.translate(torrent ? 'inner_player_torrent_disclaimer_title' : 'inner_player_disclaimer_title'),
        size: 'small',
        scroll: {
            nopadding: true
        },
        html: $('<div class="about">' + Lang.translate(torrent ? 'inner_player_torrent_disclaimer_text' : 'inner_player_disclaimer_text') + '</div>'),
        buttons: buttons,
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
    needsTorrent,
    show,
    reset,
    isWaiting
}
