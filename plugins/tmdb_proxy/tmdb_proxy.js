let tmdb_proxy = {
    name: 'TMDB Proxy',
    version: '1.0.0',
    description: 'Проксирование постеров и API сайта TMDB',

    path_image: 'http://imagetmdb.cub.watch',
    path_api: 'http://apitmdb.cub.watch',
}

Lampa.TMDB.image = function(url){
    let base  = Lampa.Utils.protocol() + 'image.tmdb.org/' + url

    return Lampa.Storage.field('proxy_tmdb') ? 'http://imagetmdb.cub.watch/' + url : base
}

Lampa.TMDB.api = function(url){
    let base  = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url

    return Lampa.Storage.field('proxy_tmdb') ? 'http://apitmdb.cub.watch/3/' + url : base
}

Lampa.Settings.listener.follow('open', function (e) {
    if(e.name == 'tmdb'){
        e.body.find('[data-parent="proxy"]').remove()
    }
})