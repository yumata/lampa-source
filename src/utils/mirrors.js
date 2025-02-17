import Manifest from './manifest'
import Request from './reguest'
import Status from './status'
import Storage from './storage'
import Utils from './math'

let network   = new Request()
let connected = true

function init(){
    setInterval(()=>{
        task()
    }, 1000 * 60 * 15)
}

function redirect(to){
    if(Manifest.cub_domain == to) return

    Storage.set('cub_domain', to, true)

    console.log('Mirrors', 'redirect to', to)
}

function find(protocol, callback){
    let status = new Status(Manifest.cub_mirrors.length)

    status.onComplite = (data)=>{
        let keys = Object.keys(data)

        if(keys.length == 0) return callback([])

        let keys_true = keys.filter((key)=> data[key] == true)

        if(keys_true.length == 0){
            console.log('Mirrors', protocol + ' all offline')

            return callback([])
        }

        console.log('Mirrors', protocol + ' online', keys_true)

        callback(keys_true)
    }

    Manifest.cub_mirrors.forEach((mirror)=>{
        check(protocol, mirror, (result)=>{
            if(result){
                console.log('Mirrors', protocol + mirror, 'is online')

                status.append(mirror, result)
            }
            else{
                console.log('Mirrors', protocol + mirror, 'is offline')

                status.error()
            }
        })
    })
}

function check(protocol, mirror, call){
    network.silent(protocol + mirror + '/api/checker', (str)=>{
        if(str == 'ok') call(true)
        else call(false)
    }, (e)=>{
        call(false)
    }, false, {
        dataType: 'text',
        timeout: 1000 * 8
    })
}

function task(call){
    let protocols = ['https://', 'http://']

    let status = new Status(protocols.length)

    connected = true

    status.onComplite = (data)=>{
        let https = data['https://']
        let http  = data['http://']

        console.log('Mirrors', 'any https:', https, 'http:', http)

        if(Storage.field('protocol') == 'https' && !https.length){
            Storage.set('protocol', 'http', true)

            if(http.length) redirect(http[0])
        }
        else if(Storage.field('protocol') == 'https' && https.length) redirect(https[0])
        else if(Storage.field('protocol') == 'http' && http.length) redirect(http[0])

        if(!https.length && !http.length) connected = false
        
        if(call) call()
    }

    check(Utils.protocol(), Manifest.cub_domain, (result)=>{
        if(result){
            if(call) call()
        }
        else{
            protocols.forEach((protocol)=>{
                find(protocol, (mirrors)=>{
                    status.append(protocol, mirrors)
                })
            })
        }
    })
}

export default {
    init,
    task,
    connected: ()=>connected
}