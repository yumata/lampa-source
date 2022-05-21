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


function connect(){
    clearInterval(ping)

    try{
        socket = new WebSocket('wss://cub.watch:8020')
    }
    catch(e){
        console.log('Socket','not work')

        return
    }

    socket.addEventListener('open', (event)=> {
        //console.log('Socket','open')

        send('start',{})

        
        ping = setInterval(()=>{
            send('ping',{})
        },5000)
    })

    socket.addEventListener('close', (event)=> {
        //console.log('Socket','close', event.code)

        setTimeout(connect,5000)
    })

    socket.addEventListener('error', (event)=> {
        console.log('Socket','error', event.message, event.code)

        socket.close()
    },false)

    socket.addEventListener('message', (event)=> {
        var result = JSON.parse(event.data)

        if(result.method == 'devices'){
            devices = result.data
        }
        else if(result.method == 'open'){
            Controller.toContent()
            
            Activity.push(result.data)
        }
        else if(result.method == 'timeline'){
            result.data.received = true //чтоб снова не остправлять и не зациклить

            Timeline.update(result.data)
        }
        else if(result.method == 'bookmarks'){
            Account.update()
        }
        else if(result.method == 'other' && result.data.submethod == 'play'){
            Controller.toContent()
            
            Player.play(result.data.object.player)
            Player.playlist(result.data.object.playlist)
        }

        listener.send('message',result)
    })
}

function send(method, data){
    var name_devise = Platform.get() ? Platform.get() : navigator.userAgent.toLowerCase().indexOf('mobile') > - 1 ? 'mobile' : navigator.userAgent.toLowerCase().indexOf('x11') > - 1 ? 'chrome' : 'other';

    data.device_id = uid
    data.name      = Utils.capitalizeFirstLetter(name_devise) + ' - ' + Storage.field('device_name')
    data.method    = method
    data.version   = 1
    data.account   = Storage.get('account','{}')

    if(socket.readyState == 1) socket.send(JSON.stringify(data))
}

export default {
    listener,
    init: connect,
    send,
    uid: ()=> { return uid },
    devices: ()=> { return devices }
}