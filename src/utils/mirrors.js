import Manifest from './manifest';
import Request from './reguest';
import Utils from './math';
import Socket from './socket';
import Platform from './platform';
import Status from './status';
import Storage from './storage'

let network = new Request()

function init(){
    setInterval(check, 1000 * 60 * 5)

    check()
}

function redirect(to){
    if(Manifest.cub_domain == to) return

    Storage.set('cub_domain', to, true)

    console.log('Mirrors', 'redirect to', to)

    //let ws = Platform.is('orsay') || Platform.is('netcast') ? 'ws://' : 'wss://'

    //window.lampa_settings.socket_url = ws + to + ':8010'

    //Socket.restart()
}

function find(){
    let status = new Status(Manifest.cub_mirrors.length)

    status.onComplite = (data)=>{
        let keys = Object.keys(data)

        if(keys.length == 0) return

        let keys_true = keys.filter((key)=> data[key] == true)

        if(keys_true.length == 0){
            console.log('Mirrors', 'all offline')

            if(Utils.protocol() == 'http://' || window.location.protocol == 'https:') return

            Storage.set('protocol', 'http')

            find()

            return
        }

        console.log('Mirrors', 'online', keys_true)

        redirect(keys_true[0])
    }

    Manifest.cub_mirrors.forEach((mirror)=>{
        network.silent(Utils.protocol() + mirror + '/api/checker', (str)=>{
            if(str == 'ok'){
                console.log('Mirrors', mirror, 'is online')

                status.append(mirror, true)
            }
            else{
                console.log('Mirrors', mirror, 'is offline')

                status.error()
            }
        }, (e)=>{
            console.log('Mirrors', mirror, 'is offline')

            status.error()
        }, false, {
            dataType: 'text',
            timeout: 1000 * 10
        })
    })
}

function check(){
    network.silent(Utils.protocol() + Manifest.cub_domain + '/api/checker', (str)=>{
        if(str == 'ok'){
            console.log('Mirrors', Manifest.cub_domain + ' is online')
        }
        else{
            console.log('Mirrors', Manifest.cub_domain + ' is offline')

            find()
        }
    }, ()=>{
        console.log('Mirrors', Manifest.cub_domain + ' is offline')

        find()
    }, false, {
        dataType: 'text',
        timeout: 1000 * 10
    })
}

export default {
    init
}