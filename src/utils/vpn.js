import Manifest from './manifest'
import Request from './reguest'
import Storage from './storage'
import Plugins from './plugins'
import Arrays from './arrays'
import Utils from './math'

/**
 * Короче, постоянно пишут (почему нет картинок?)
 * Решил сделать автоматическую установку TMDB Proxy если регион RU
 */

let network  = new Request()
let attempts = 0

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

function init(){
    if(Storage.get('vpn_checked_ready', 'false') || Storage.get('tmdb_proxy_api', '') || Storage.get('tmdb_proxy_image', '') || window.lampa_settings.disable_features.install_proxy) return

    let install = (country)=>{
        console.log('VPN', 'country ' + country)

        if(country.trim().toLowerCase() == 'ru'){
            //ну это наш клиент

            let ready = Plugins.get().find(a=>(a.url + '').indexOf('plugin/tmdb-proxy') >= 0)

            if(!ready){
                console.log('VPN', 'install TMDB Proxy')

                Plugins.add({url: Utils.protocol() + Manifest.cub_domain + '/plugin/tmdb-proxy', status: 1, name: 'TMDB Proxy', author: '@lampa'})
            }
        }
    }

    let installed = Plugins.get().find(a=>(a.url + '').indexOf('plugin/tmdb-proxy') >= 0)

    if(!installed){
        console.log('VPN', 'start install TMDB Proxy')

        extract(install, ()=>{
            console.log('VPN', 'domain not responding')

            attempts++

            //попробуем еще раз, может зеркало подключилось

            if(attempts <= 3){
                Storage.set('vpn_checked_ready', false)

                setTimeout(init, 1000*30)
            }
        })
    }

    Storage.set('vpn_checked_ready', true)
}

export default {
    init,
    region
}