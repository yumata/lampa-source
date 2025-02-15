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

let network  = new Request()

function region(call){
    let reg = Storage.get('region','{}')

    Arrays.extend({
        time: 0
    })

    if(!reg.code || reg.time + 1000*60*60*24 < Date.now()){
        let extracted = (code)=>{
            Storage.set('region',{
                code: code.toLowerCase(),
                time: Date.now()
            })

            call(code.toLowerCase())
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
        console.log('VPN', 'domain responding ', country)

        if(country.trim().toLowerCase() == 'ru'){
            console.log('VPN', 'launch TMDB Proxy')

            TMDBProxy.init()
        }

        call()
    }, ()=>{
        console.log('VPN', 'domain not responding')

        call()
    })
}

export default {
    region,
    task
}