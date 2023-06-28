let tmdb_proxy = {
    name: 'TMDB Proxy',
    version: '1.0.1',
    description: 'Проксирование постеров и API сайта TMDB',

    path_image: '://imagetmdb.com/',
    path_api: 'http://apitmdb.cub.watch/3/',
}

Lampa.SettingsApi.addParam({
    component: 'tmdb',
    param: {
        name: 'tmdb_protocol',
        type: 'select',
        values: {
            http: 'HTTP',
            https: 'HTTPS',
        },
        default: 'https'
    },
    field: {
        name: Lampa.Lang.translate('torrent_error_step_3'),
    },
    onChange: ()=>{}
})

Lampa.TMDB.image = function(url){
    let base  = Lampa.Utils.protocol() + 'image.tmdb.org/' + url

    return Lampa.Storage.field('proxy_tmdb') ? Lampa.Storage.field('tmdb_protocol') + tmdb_proxy.path_image + url : base
}

Lampa.TMDB.api = function(url){
    let base  = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url

    return Lampa.Storage.field('proxy_tmdb') ? tmdb_proxy.path_api + url : base
}

Lampa.Settings.listener.follow('open', function (e) {
    if(e.name == 'tmdb'){
        e.body.find('[data-parent="proxy"]').remove()
    }
})

console.log('TMDB-Proxy','started, enabled:', Lampa.Storage.field('proxy_tmdb'))