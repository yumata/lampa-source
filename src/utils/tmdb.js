import Storage from './storage'
import Utils from './math'

function proxy(name){
    let proxy = Storage.get(name,'')

    //proxy remove end slash
    if(proxy.length > 0 && proxy.charAt(proxy.length - 1) == '/'){
        proxy = proxy.substring(0, proxy.length - 1)
    }

    return Utils.checkHttp(proxy)
}

function api(url){
    let base  = Utils.protocol() + 'api.themoviedb.org/3/' + url

    return Storage.field('proxy_tmdb') && Storage.get('tmdb_proxy_api','') ? proxy('tmdb_proxy_api') + '/' + base : base
}

function image(url){
    let base  = Utils.protocol() + 'image.tmdb.org/' + url

    return Storage.field('proxy_tmdb') && Storage.get('tmdb_proxy_image','') ? proxy('tmdb_proxy_image') + '/' + base : base
}

function key(){
    return '4ef0d7355d9ffb5151e987764708ce96'
}

export default {
    api,
    key,
    image
}