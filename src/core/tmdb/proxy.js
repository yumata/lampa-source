import Account from '../account/account.js'
import Manifest from '../manifest.js'
import Storage from '../storage/storage.js'
import Utils from '../../utils/utils.js'
import TMDB from './tmdb.js'
import Settings from '../../interaction/settings/settings.js'

function init(){
    let tmdb_proxy = {
        name: 'TMDB Proxy',
        version: '1.0.3',
        description: 'Проксирование постеров и API сайта TMDB',

        path_image: Account.hasPremium() ? 'imagetmdb.'+ Manifest.cub_domain+'/' : 'imagetmdb.com/',
        path_api: 'apitmdb.'+Manifest.cub_domain+'/3/',

        path_image_backup: 'lampa.byskaz.ru/tmdb/img/',
        path_api_backup: 'lampa.byskaz.ru/tmdb/api/3/'
    }

    function filter(u){
        let s = u.slice(0, 8)
        let e = u.slice(8).replace(/\/+/g,'/')

        return s + e
    }

    function email(){
        return Storage.get('account','{}').email || ''
    }

    function check(){
        console.log('TMDB-Proxy', 'start check', Manifest.cub_domain)

        $.ajax({
            url: TMDB.api('discover/movie?with_genres=14&api_key=' + TMDB.key() + '&language=ru-RU'),
            dataType: 'json',
            timeout: 6000,
            error: function(){
                console.warn('TMDB-Proxy','api error', tmdb_proxy.path_api + ' not responding, using backup proxy', tmdb_proxy.path_api_backup)

                if(Utils.protocol() == 'https://' || Storage.field('protocol') == 'https'){
                    console.error('TMDB-Proxy','api cannot use https, use http only')
                }
                else{
                    tmdb_proxy.path_api = tmdb_proxy.path_api_backup
                }
            }
        })

        let test_image = new Image()

        test_image.onload = function() {
            console.log('TMDB-Proxy', 'image proxy is working', tmdb_proxy.path_image)
        }

        test_image.onerror = function() {
            console.warn('TMDB-Proxy', 'image error', tmdb_proxy.path_image + ' not responding, using backup proxy', tmdb_proxy.path_image_backup)

            if(Utils.protocol() == 'https://' || Storage.field('protocol') == 'https'){
                console.error('TMDB-Proxy','image cannot use https, use http only')
            }
            else{
                tmdb_proxy.path_image = tmdb_proxy.path_image_backup
            }
        }

        test_image.src = TMDB.image('t/p/w200/3txl2FUNZCQUnHQPzkuNc17yLIs.jpg')
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

    console.log('TMDB-Proxy', Storage.field('proxy_tmdb') ? 'enabled' : 'disabled')

    check()
}

export default {
    init
}