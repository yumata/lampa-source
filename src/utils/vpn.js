import Manifest from './manifest'
import Request from './reguest'
import Storage from './storage'
import Plugins from './plugins'
import Arrays from './arrays'

/**
 * Короче, постоянно пишут (почему нет картинок?)
 * Решил сделать автоматическую установку TMDB Proxy если регион RU
 */

let network = new Request()

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

        extract('https', extracted,()=>{
            //может не работает https

            Storage.set('protocol', 'http')

            console.log('VPN', 'disable HTTPS')

            extract('http', extracted, ()=>{
                console.log('VPN', 'domain not responding')

                Storage.set('region',{
                    code: Storage.field('language'),
                    time: Date.now()
                })

                call(Storage.field('language'))
            })
        })
    }
    else call(reg.code)
}

let extract = (proto, call, error)=>{
    network.silent(proto + '://geo.' + Manifest.cub_domain,call,error,false,{
        dataType: 'text'
    })
}

function init(){
    if(Storage.get('vpn_checked_ready', 'false') || Storage.get('tmdb_proxy_api', '') || Storage.get('tmdb_proxy_image', '') || window.lampa_settings.disable_features.install_proxy) return

    let install = (country)=>{
        console.log('VPN', 'country ' + country)

        if(country.trim() == 'RU'){
            //ну это наш клиент

            let ready = Plugins.get().find(a=>(a.url + '').indexOf('plugin/tmdb-proxy') >= 0)

            if(!ready){
                console.log('VPN', 'install TMDB Proxy')

                Plugins.add({url: 'http://' + Manifest.cub_domain + '/plugin/tmdb-proxy', status: 1, name: 'TMDB Proxy', author: '@lampa'})
            }
        }
    }

    let installed = Plugins.get().find(a=>(a.url + '').indexOf('plugin/tmdb-proxy') >= 0)

    if(!installed){
        console.log('VPN', 'start install TMDB Proxy')

        extract('https', install,()=>{
            //может не работает https

            Storage.set('protocol', 'http')

            console.log('VPN', 'disable HTTPS')

            extract('http', install, ()=>{
                console.log('VPN', 'domain not responding')

                //хммм...., наверно к домену не подключается
            })
        })
    }

    Storage.set('vpn_checked_ready', true)
}

export default {
    init,
    region
}