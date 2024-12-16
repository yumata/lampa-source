import Utils from './math'
import Activity from '../interaction/activity'
import Storage from './storage'
import Controller from '../interaction/controller'
import Platform from './platform'
import Subscribe from './subscribe'
import Player from '../interaction/player'
import Timeline from '../interaction/timeline'
import Account from './account'
import Modal from '../interaction/modal'
import Lang from './lang'

let socket
let ping

let uid      = Utils.uid()
let devices  = []
let listener = Subscribe()
let expects  = []
let timeping = 5000
let timeout


function connect(){
    if(!window.lampa_settings.socket_use) return

    clearInterval(ping)

    clearTimeout(timeout)

    timeout = setTimeout(()=>{
        console.log('Socket','timeout close')

        if(socket) socket.close()
    },10000)

    try{
        socket = new WebSocket(window.lampa_settings.socket_url)
    }
    catch(e){
        console.log('Socket','not work')
    }

    if(!socket) return

    socket.addEventListener('open', (event)=> {
        console.log('Socket','open')

        timeping = 5000

        clearTimeout(timeout)

        send('start',{})

        listener.send('open',{})
    })

    socket.addEventListener('close', (event)=> {
        console.log('Socket','close', event.code)

        clearTimeout(timeout)

        listener.send('close',{})

        timeping = Math.max(1000 * 60 * 5,timeping)

        console.log('Socket','try connect after', Math.round(timeping) / 1000, 'sec.')

        setTimeout(connect,Math.round(timeping))

        timeping *= 2
    })

    socket.addEventListener('error', (event)=> {
        console.log('Socket','error:','maybe there is no connection to the server')

        socket.close()
    },false)

    socket.addEventListener('message', (event)=> {
        var result = JSON.parse(event.data)

        if(window.lampa_settings.socket_methods){
            if(result.method == 'devices'){
                devices = result.data
            }
            else if(result.method == 'open'){
                Controller.toContent()
                
                Activity.push(result.data)
            }
            else if(result.method == 'timeline'){
                result.data.received = true //чтоб снова не остправлять и не зациклить

                let account  = Account.canSync()

                if(account && account.profile && account.profile.id == result.data.profile){
                    Timeline.update(result.data)
                }
            }
            else if(result.method == 'bookmarks'){
                Account.update()
            }
            else if(result.method == 'logoff'){
                Account.logoff(result.data)
            }
            else if(result.method == 'other' && result.data.submethod == 'play'){
                Controller.toContent()

                Modal.open({
                    title: '',
                    align: 'center',
                    html: $('<div class="about">' + Lang.translate('confirm_open_player')+'</div>'),
                    buttons: [
                        {
                            name: Lampa.Lang.translate('settings_param_no'),
                            onSelect: ()=>{
                                Modal.close()
            
                                Controller.toggle('content')
                            }
                        },
                        {
                            name: Lampa.Lang.translate('settings_param_yes'),
                            onSelect: ()=>{
                                Modal.close()

                                Controller.toggle('content')

                                Player.play(result.data.object.player)
                                Player.playlist(result.data.object.playlist)
                            }
                        }
                    ],
                    onBack: ()=>{
                        Modal.close()
            
                        Controller.toggle('content')
                    }
                })
                
                
            }
        }

        listener.send('message',result)
    })

    setInterval(()=>{
        if(expects.length > 50) expects = expects.slice(-50)

        if(socket && socket.readyState == 1 && expects.length){
            let msg = expects.shift()

            console.log('Socket','sent with a delay:', msg.method)

            send(msg.method, msg)
        }
    },1000)
}

function send(method, data){
    let name_devise = Platform.get() ? Platform.get() : navigator.userAgent.toLowerCase().indexOf('mobile') > - 1 ? 'mobile' : navigator.userAgent.toLowerCase().indexOf('x11') > - 1 ? 'chrome' : 'other';

    data.device_id = uid
    data.name      = Utils.capitalizeFirstLetter(name_devise) + ' - ' + Storage.field('device_name')
    data.method    = method
    data.version   = 1
    data.account   = Storage.get('account','{}')
    data.premium   = Account.hasPremium()

    if(socket && socket.readyState == 1) socket.send(JSON.stringify(data))
    else expects.push(data)
}

export default {
    listener,
    init: connect,
    send,
    uid: ()=> { return uid },
    devices: ()=> { return devices }
}