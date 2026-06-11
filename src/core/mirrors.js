import Manifest from './manifest'
import Status from '../utils/status'
import Storage from './storage/storage'
import Markers from './markers'
import Timer from './timer'

let connected = true
let protocols = ['https://', 'http://']

function init(){
    Timer.add(1000 * 60 * 15, ()=>{
        task()
    })
}

/**
 * Редирект на живое зеркало
 * @param {string} to ссылка на зеркало
 */
function redirect(to){
    let domain = to.replace(/http:\/\/|https:\/\//, '')

    Storage.set('cub_domain', domain, true)
    Storage.set('cub_alive', to, true)

    console.log('Mirrors', 'redirect to', to)
}

/**
 * Проверить живые зеркала по протоколу и вернуть массив живых зеркал
 * @param {string} protocol протокол для проверки
 * @param {function} callback функция обратного вызова с массивом живых зеркал
 */
function find(protocol, callback){
    let status = new Status(Manifest.cub_mirrors.length)

    status.onComplite = (data)=>{
        let keys = Object.keys(data)

        if(keys.length == 0) return callback([])

        let answered = keys.filter((key)=> data[key] == true)

        if(answered.length == 0){
            console.error('Mirrors', protocol + ' all offline')

            return callback([])
        }

        console.log('Mirrors', protocol + ' online', answered)

        callback(answered)
    }

    Manifest.cub_mirrors.forEach((mirror)=>{
        check(protocol + mirror, (answered)=>{
            if(answered){
                console.log('Mirrors', protocol + mirror, 'is online')

                status.append(mirror, answered)
            }
            else{
                console.warn('Mirrors', protocol + mirror, 'is offline')

                status.error()
            }
        })
    })
}

/**
 * Проверить живое зеркало по ссылке и вернуть результат
 * @param {string} url ссылка для проверки
 * @param {function} call функция обратного вызова с результатом проверки
 */
function check(url, call){
    let random = Math.random() + ''

    $.ajax({
        url: url + '/api/checker',
        type: 'POST',
        data: {
            data: random
        },
        dataType: 'text',
        timeout: 1000 * 7,
        success: (str)=>{
            if(str == random) call(true)
            else call(false)
        },
        error: ()=>{
            call(false)
        }
    })
}

/**
 * Загрузочная задача для проверки живых зеркал и редиректа на первое живое
 * @param {function} call функция обратного вызова
 */
function task(call){
    if(!window.lampa_settings.mirrors) return call && call()

    let status = new Status(protocols.length)

    connected = true

    status.onComplite = (data)=>{
        let https = data['https://']
        let http  = data['http://']
        let all   = [].concat(https.map(a=>'https://' + a)).concat(http.map(a=>'http://' + a))

        console.log('Mirrors', 'answered:', all)

        if(!all.length) connected = false
        else redirect(all[0])

        if(!connected) Markers.error('mirrors')
        else Markers.normal('mirrors')
        
        if(call) call()
    }

    check(Manifest.cub_alive, (answered)=>{
        console.log('Mirrors', 'first check:', Manifest.cub_alive, 'status:', answered)

        if(answered){
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