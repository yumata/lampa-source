import Manifest from './manifest'
import Request from './reguest'
import Storage from './storage'
import Arrays from './arrays'
import Utils from './math'
import TMDBProxy from './tmdb_proxy'

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
            code = code || 'ru'

            Storage.set('region',{
                code: code,
                time: Date.now()
            })

            call(code)
        }

        extract(extracted, ()=>{
            console.log('VPN', 'domain not responding')

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
    network.silent(Utils.protocol() + 'geo.' + Manifest.cub_domain,call,error,false,{
        dataType: 'text',
        timeout: 8000
    })
}

function task(call){
    extract((country)=>{
        console.log('VPN', 'geo.' + Manifest.cub_domain + ' domain responding ', country)

        let code = country.trim().toLowerCase()

        if(code.length > 2) code = 'ru' //какой-то документ возвращается

        if((code == 'ru' || code == 'be' || country == '') && !window.lampa_settings.disable_features.install_proxy){
            console.log('VPN', 'launch TMDB Proxy')

            TMDBProxy.init()
        }

        responce_code = code || 'ru'

        call()
    }, (e,x)=>{
        console.log('VPN', 'geo.' + Manifest.cub_domain + ' domain not responding:', network.errorDecode(e,x))

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