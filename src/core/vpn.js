import Manifest from './manifest'
import Request from '../utils/reguest'
import Storage from './storage/storage'
import Arrays from '../utils/arrays'
import Utils from '../utils/utils'
import TMDBProxy from './tmdb/proxy'

/**
 * Короче, постоянно пишут (почему нет картинок?)
 * Решил сделать автоматическую установку TMDB Proxy если регион RU
 */

let network = new Request()
let responce_code = 'ru'

function region(call){
    let reg = Storage.get('region','{}')

    Arrays.extend({
        time: 0
    })

    if(!reg.code || reg.time + 1000*60*60*24 < Date.now()){
        let extracted = (code)=>{
            code = code.trim().toLowerCase()
            code = code.length <= 2 ? code || 'ru' : 'ru'

            Storage.set('region',{
                code: code,
                time: Date.now()
            })

            call(code)
        }

        extract(extracted, (e,x)=>{
            console.warn('VPN', 'geo.' + Manifest.cub_domain + ' domain not responding', network.errorDecode(e,x))

            Storage.set('region',{
                code: Storage.field('language'),
                time: Date.now()
            })

            call(Storage.field('language'))
        })
    }
    else call(reg.code)
}

let extract = (call, error)=>{
    $.ajax({
        url: Utils.protocol() + 'geo.' + Manifest.cub_domain,
        type: 'GET',
        dataType: 'text',
        timeout: 8000,
        success: call,
        error: error
    })
}

function task(call){
    extract((country)=>{
        console.log('VPN', 'geo.' + Manifest.cub_domain + ' domain responding ', country)

        country = country.trim().toLowerCase()
        
        if(country.length > 10){
            country = 'ru'

            console.warn('VPN', 'wrong responce, use default ru')
        } 

        if((country == 'ru' || country == 'by' || country == '' || country.length > 10) && !window.lampa_settings.disable_features.install_proxy){
            console.log('VPN', 'launch TMDB Proxy')

            TMDBProxy.init()
        }

        responce_code = country || 'ru'

        call()
    }, (e,x)=>{
        console.warn('VPN', 'geo.' + Manifest.cub_domain + ' domain not responding:', network.errorDecode(e,x))

        if(!window.lampa_settings.disable_features.install_proxy){
            console.log('VPN', 'launch TMDB Proxy')

            TMDBProxy.init() //будем считать что если не ответил, то все равно запускаем
        }

        call()
    })
}

export default {
    region,
    task,
    code: ()=>responce_code,
}