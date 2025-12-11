import Utils from '../utils/utils'
import Activity from '../interaction/activity/activity'
import Storage from './storage/storage'
import Controller from './controller'
import Platform from './platform'
import Subscribe from '../utils/subscribe'
import Player from '../interaction/player'
import Timeline from '../interaction/timeline'
import Account from './account/account'
import Modal from '../interaction/modal'
import Lang from './lang'
import Manifest from './manifest'
import Markers from './markers'
import Arrays from '../utils/arrays'
import Timer from './timer'

let socket
let ping

let uid      = Utils.uid()
let devices  = []
let listener = Subscribe()
let expects  = []
let timeping = 5000
let timeout
let used_mirrors = -1
let terminal_access = false


function connect(){
    if(!window.lampa_settings.socket_use) return

    let ws = Platform.is('orsay') || Platform.is('netcast') ? 'ws://' : 'wss://'
    let pt = Platform.is('orsay') || Platform.is('netcast') ? ':8080' : ':8443'

    let mirrors = Manifest.soc_mirrors
    let mirror  = mirrors[used_mirrors + 1] || mirrors[0]

    used_mirrors = (used_mirrors + 1) % mirrors.length

    let socket_url = ws + mirror + pt

    if(window.lampa_settings.socket_url) socket_url = window.lampa_settings.socket_url
    
    clearInterval(ping)

    clearTimeout(timeout)

    timeout = setTimeout(()=>{
        console.log('Socket','timeout close')

        if(socket) socket.close()
    },10000)

    try{
        socket = new WebSocket(socket_url)
    }
    catch(e){
        console.log('Socket','not work')
    }

    if(!socket) return

    socket.addEventListener('open', (event)=> {
        console.log('Socket','open on ' + socket_url)

        timeping = 5000

        clearTimeout(timeout)

        send('start',{})

        listener.send('open',{})

        Markers.live('socket')
    })

    socket.addEventListener('close', (event)=> {
        console.log('Socket','close', event.code)

        clearTimeout(timeout)

        listener.send('close',{})

        timeping = Math.min(1000 * 60 * 5,timeping)

        console.log('Socket','try connect to '+socket_url+' after', Math.round(timeping) / 1000, 'sec.')

        setTimeout(connect,Math.round(timeping))

        timeping *= 2

        Markers.error('socket')
    })

    socket.addEventListener('error', (event)=> {
        console.log('Socket','error:','maybe there is no connection to the server')

        socket.close()
    },false)

    socket.addEventListener('message', (event)=> {
        if(event.data == 'pong') {
            socket.alive = true

            return
        } 

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

                let account = Account.Permit.account

                if(Account.Permit.sync && account.profile && account.profile.id == result.data.profile){
                    Timeline.update(result.data)
                }
            }
            else if(result.method == 'bookmarks'){
                Account.Bookmarks.update()
            }
            else if(result.method == 'terminal_activate'){
                if(Storage.get('terminal_access','') == result.data.code){
                    terminal_access = true

                    send('terminal_result', {result: 'Terminal access activated'})
                }
            }
            else if(result.method == 'terminal_eval'){
                if(Storage.get('terminal_access','') == result.data.code){
                    let stroke = ''
                    let tojson = {}

                    console.log('Socket','terminal eval', result.data.eval)

                    try{
                        stroke = eval(result.data.eval)
                    }
                    catch(e){
                        stroke = e.message + ' ' + e.stack
                    }
                    
                    try{
                        if(Arrays.isObject(stroke) || Arrays.isArray(stroke)) tojson = JSON.stringify(stroke)
                    }
                    catch(e){
                        tojson = stroke
                    }

                    if(typeof stroke == 'function'){
                        tojson = 'Function cannot be converted to JSON'
                    }

                    if(typeof stroke == 'string' || typeof stroke == 'number' || typeof stroke == 'boolean'){
                        tojson = stroke
                    }
                    else if(stroke === undefined){
                        tojson = 'undefined'
                    }
                    else if(stroke === null){
                        tojson = 'null'
                    }
                    else tojson = 'unknown type'

                    console.log('Socket','terminal eval result', tojson)

                    send('terminal_result', {result: tojson})
                }
            }
            else if(result.method == 'logoff'){
                Account.logoff(result.data)
            }
            else if(result.method == 'info'){
                console.log('Socket','info', result.data)
            }
            else if(result.method == 'token_status'){
                console.log('Socket','token status', result.data)
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

        Markers.pass('socket')

        listener.send('message',result)
    })

    Timer.add(1000,()=>{
        if(expects.length > 50) expects = expects.slice(-50)

        if(socket && socket.readyState == 1 && expects.length){
            let msg = expects.shift()

            console.log('Socket','sent with a delay:', msg.method)

            send(msg.method, msg)
        }
    })

    Timer.add(1000 * 30,()=>{
        if(socket && socket.readyState == 1){
            socket.alive = false

            setTimeout(()=>{
                if(!socket.alive){
                    console.log('Socket','ping timeout, maybe connection lost')
                }
            },2000)

            socket.send('ping')
        }
    })
}

function send(method, data){
    let name_devise = Platform.get() ? Platform.get() : navigator.userAgent.toLowerCase().indexOf('mobile') > - 1 ? 'mobile' : navigator.userAgent.toLowerCase().indexOf('x11') > - 1 ? 'chrome' : 'other';

    data.device_id = uid
    data.name      = Utils.capitalizeFirstLetter(name_devise) + ' - ' + Storage.field('device_name')
    data.method    = method
    data.version   = 1
    data.account   = Storage.get('account','{}')
    data.premium   = Account.hasPremium()
    data.terminal  = Storage.get('terminal_access', '')

    if(socket && socket.readyState == 1) socket.send(JSON.stringify(data))
    else expects.push(data)

    Markers.pass('socket')
}

function restart(){
    if(socket) socket.close()

    connect()
}

export default {
    listener,
    init: connect,
    send,
    uid: ()=> uid,
    devices: ()=> devices,
    restart,
    terminalAccess: ()=> terminal_access,
}