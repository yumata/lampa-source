import Utils from './math'
import Activity from '../interaction/activity'
import Storage from './storage'

let socket
let ping

let uid     = Utils.uid()
let devices = []


function connect(){
    clearInterval(ping);

    console.log('Socket','try connect', uid)

    try{
        socket = new WebSocket('wss://cub.watch:8020')
    }
    catch(e){
        console.log('Socket','not work')

        return
    }

    socket.addEventListener('open', (event)=> {
        console.log('Socket','open')

        send('start',{})

        
        ping = setInterval(()=>{
            send('ping',{})
        },5000)
    })

    socket.addEventListener('close', (event)=> {
        console.log('Socket','close', event.code)

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
            Activity.push(result.data)
        }
    })
}

function send(method, data){
    data.device_id = uid
    data.name      = Storage.field('device_name')
    data.method    = method
    data.version   = 1

    socket.send(JSON.stringify(data))
}

export default {
    init: connect,
    send
}