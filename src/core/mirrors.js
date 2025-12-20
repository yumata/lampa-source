import Manifest from './manifest'
import Request from '../utils/reguest'
import Status from '../utils/status'
import Storage from './storage/storage'
import Utils from '../utils/utils'
import Markers from './markers'
import Timer from './timer'

let network   = new Request()
let connected = true

function init(){
    Timer.add(1000 * 60 * 15, ()=>{
        task()
    })
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
            console.error('Mirrors', protocol + ' all offline')

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
                console.warn('Mirrors', protocol + mirror, 'is offline')

                status.error()
            }
        })
    })
}

function check(protocol, mirror, call){
    let random = Math.random() + ''

    network.silent(protocol + mirror + '/api/checker', (str)=>{
        if(str == random) call(true)
        else call(false)
    }, (e)=>{
        call(false)
    }, {
        data: random,
    }, {
        dataType: 'text',
        timeout: 1000 * 7
    })
}

function task(call){
    if(!window.lampa_settings.mirrors) return call && call()

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

        if(!connected) Markers.error('mirrors')
        else Markers.normal('mirrors')
        
        if(call) call()
    }

    check(Utils.protocol(), Manifest.cub_domain, (result)=>{
        console.log('Mirrors', 'first check:', Manifest.cub_domain, 'status:', result)

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

function test(call){
    let protocols = ['https://', 'http://']

    let status = new Status(protocols.length)

    status.onComplite = (data)=>{
        let https = data['https://']
        let http  = data['http://']

        console.log('Mirrors', 'test complite', 'https:', https, 'http:', http)

        if(call) call()
    }

    console.log('Mirrors', 'start test')

    protocols.forEach((protocol)=>{
        find(protocol, (mirrors)=>{
            status.append(protocol, mirrors)
        })
    })
}

export default {
    init,
    task,
    connected: ()=>connected,
    test
}