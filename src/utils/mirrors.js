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
    let from = Storage.get('cub_domain', '')

    if(from == to || (from == '' && to == Manifest.cub_mirrors[0])) return

    Storage.set('cub_domain', to, true)

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
        network.silent(Utils.protocol() + mirror + '/api/checker', ()=>{
            console.log('Mirrors', mirror, 'is online')

            status.append(mirror, true)
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
    network.silent(Utils.protocol() + Manifest.cub_mirrors[0] + '/api/checker', ()=>{
        console.log('Mirrors', 'Cub is online')

        redirect(Manifest.cub_mirrors[0])
    }, ()=>{
        console.log('Mirrors', 'Cub is offline')

        find()
    }, false, {
        dataType: 'text',
        timeout: 1000 * 10
    })
}

export default {
    init
}