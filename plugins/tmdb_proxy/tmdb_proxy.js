let tmdb_proxy = {
    name: 'TMDB Proxy',
    version: '1.0.3',
    description: 'Проксирование постеров и API сайта TMDB',

    path_image: Lampa.Account.hasPremium() ? 'imagetmdb.cub.red/' : 'imagetmdb.com/',
    path_api: 'apitmdb.'+(Lampa.Manifest && Lampa.Manifest.cub_domain ? Lampa.Manifest.cub_domain : 'cub.red')+'/3/'
}

function filter(u){
    let s = u.slice(0, 8)
    let e = u.slice(8).replace(/\/+/g,'/')

    return s + e
}

function email(){
    return Lampa.Storage.get('account','{}').email || ''
}

Lampa.TMDB.image = function(url){
    let base  = Lampa.Utils.protocol() + 'image.tmdb.org/' + url

    return Lampa.Utils.addUrlComponent(filter(Lampa.Storage.field('proxy_tmdb') ? Lampa.Utils.protocol() + tmdb_proxy.path_image + url : base), 'email=' + email())
}

Lampa.TMDB.api = function(url){
    let base  = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url

    return Lampa.Utils.addUrlComponent(filter(Lampa.Storage.field('proxy_tmdb') ? Lampa.Utils.protocol() + tmdb_proxy.path_api + url : base), 'email=' + email())
}

Lampa.Settings.listener.follow('open', function (e) {
    if(e.name == 'tmdb'){
        e.body.find('[data-parent="proxy"]').remove()
    }
})

console.log('TMDB-Proxy','started, enabled:', Lampa.Storage.field('proxy_tmdb'))