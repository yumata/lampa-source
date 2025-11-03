let Account = Lampa.Account
let Manifest = Lampa.Manifest
let Storage = Lampa.Storage
let Utils = Lampa.Utils
let TMDB = Lampa.TMDB
let Settings = Lampa.Settings
let Arrays = Lampa.Arrays

function ImageMirror(){
    let stat    = []
    let mirrors = [
        'imagetmdb.com/',
        'nl.imagetmdb.com/',
        'de.imagetmdb.com/',
        'pl.imagetmdb.com/',
        'lampa.byskaz.ru/tmdb/img/'
    ]

    if(Account.hasPremium()) Arrays.insert(mirrors, 0, 'imagetmdb.'+ Manifest.cub_domain+'/')

    mirrors.forEach(mirror=>{
        stat[mirror] = {
            errors: [],
            banned: false
        }
    })


    this.current = function(){
        let free = mirrors.filter(mirror=>!stat[mirror].banned)
        let last = Storage.get('tmdb_img_mirror', '')

        if(free.indexOf(last) > -1){
            return last
        }
        else if(free.length){
            Storage.set('tmdb_img_mirror', free[0])

            return free[0]
        }

        return free.length ? free[0] : mirrors[0]
    }

    this.broken = function(url){
        mirrors.forEach(mirror=>{
            if(url && url.indexOf('://' + mirror) !== -1){
                let now = Date.now()
                let s   = stat[mirror]

                s.errors.push(now)
                s.errors = s.errors.filter(t => now - t < 10000);

                console.log('TMDB-Proxy','mirror', mirror, 'errors', s.errors.length)

                if(s.errors.length >= 20){
                    s.banned = true
                    s.errors = []

                    console.warn('TMDB-Proxy','mirror', mirror, 'banned')
                }
            }
        })
    }
}

function init(){
    let tmdb_proxy = {
        name: 'TMDB Proxy',
        version: '1.0.6',
        description: 'Проксирование постеров и API сайта TMDB',

        path_api: 'apitmdb.'+Manifest.cub_domain+'/3/',
        path_api_backup: 'lampa.byskaz.ru/tmdb/api/3/',
    }

    let IMG = new ImageMirror()

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

        return Utils.addUrlComponent(filter(Storage.field('proxy_tmdb') ? Utils.protocol() + IMG.current() + url : base), 'email=' + encodeURIComponent(email()))
    }

    TMDB.api = function(url){
        let base  = Utils.protocol() + 'api.themoviedb.org/3/' + url

        return Utils.addUrlComponent(filter(Storage.field('proxy_tmdb') ? Utils.protocol() + tmdb_proxy.path_api + url : base), 'email=' + encodeURIComponent(email()))
    }

    TMDB.broken = function(url){
        IMG.broken(url)
    }

    Settings.listener.follow('open', function (e) {
        if(e.name == 'tmdb'){
            e.body.find('[data-parent="proxy"]').remove()
        }
    })

    console.log('TMDB-Proxy','init')

    console.log('TMDB-Proxy', Storage.field('proxy_tmdb') ? 'enabled' : 'disabled')
}

init()