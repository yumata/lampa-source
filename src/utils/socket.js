import Utils from './math'
import Activity from '../interaction/activity'
import Storage from './storage'
import Controller from '../interaction/controller'
import Platform from './platform'
import Subscribe from './subscribe'
import Player from '../interaction/player'
import Timeline from '../interaction/timeline'
import Account from './account'

let socket
let ping

let uid      = Utils.uid()
let devices  = []
let listener = Subscribe()
let expects  = []


function connect(){
    if(!window.lampa_settings.socket_use) return

    clearInterval(ping)

    try{
        socket = new WebSocket(window.lampa_settings.socket_url)
    }
    catch(e){
        console.log('Socket','not work')
    }

    if(!socket) return

    socket.addEventListener('open', (event)=> {
        console.log('Socket','open')

        send('start',{})

        listener.send('open',{})
    })

    socket.addEventListener('close', (event)=> {
        console.log('Socket','close', event.code)

        listener.send('close',{})

        setTimeout(connect,5000)
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

                if(account && result.account && result.account.profile && account.profile.id == result.account.profile.id){
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
                
                Player.play(result.data.object.player)
                Player.playlist(result.data.object.playlist)
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