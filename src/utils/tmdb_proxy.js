import Account from './account.js'
import Manifest from './manifest.js'
import Storage from './storage.js'
import Utils from './math.js'
import TMDB from './tmdb.js'
import Settings from '../components/settings.js'

function init(){
    let tmdb_proxy = {
        name: 'TMDB Proxy',
        version: '1.0.3',
        description: 'Проксирование постеров и API сайта TMDB',

        path_image: Account.hasPremium() ? 'imagetmdb.'+ Manifest.cub_domain+'/' : 'imagetmdb.com/',
        path_api: 'apitmdb.'+Manifest.cub_domain+'/3/'
    }

    function filter(u){
        let s = u.slice(0, 8)
        let e = u.slice(8).replace(/\/+/g,'/')

        return s + e
    }

    function email(){
        return Storage.get('account','{}').email || ''
    }

    TMDB.image = function(url){
        let base  = Utils.protocol() + 'image.tmdb.org/' + url

        return Utils.addUrlComponent(filter(Storage.field('proxy_tmdb') ? Utils.protocol() + tmdb_proxy.path_image + url : base), 'email=' + encodeURIComponent(email()))
    }

    TMDB.api = function(url){
        let base  = Utils.protocol() + 'api.themoviedb.org/3/' + url

        return Utils.addUrlComponent(filter(Storage.field('proxy_tmdb') ? Utils.protocol() + tmdb_proxy.path_api + url : base), 'email=' + encodeURIComponent(email()))
    }

    Settings.listener.follow('open', function (e) {
        if(e.name == 'tmdb'){
            e.body.find('[data-parent="proxy"]').remove()
        }
    })

    console.log('TMDB-Proxy','init')

    console.log('TMDB-Proxy','enabled', Storage.field('proxy_tmdb'))
}

export default {
    init
}