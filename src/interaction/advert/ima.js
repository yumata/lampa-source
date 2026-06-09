
import Utils from '../../utils/utils'
import Storage from '../../core/storage/storage'
import Platform from '../../core/platform'
import Torserver from '../torserver'
import Activity from '../activity/activity'
import Manifest from '../../core/manifest'
import Account from '../../core/account/account'
import Personal from '../../core/personal'
import Metric from '../../services/metric'

let sdk2_try    = 0
let sdk3_try    = 0

function loadSDK(api){
    return api == 3 ? loadSDK3() : loadSDK2()
}

function loadSDK2(){
    return new Promise((resolve, reject) => {
        if(window.VASTPlayer){
            return resolve()
        }

        if(sdk2_try > 1){
            return reject(new Error('VASTPlayer SDK load failed after multiple attempts'))
        }

        sdk2_try++

        Utils.putScriptAsync([Manifest.github_lampa + '/vender/vast/vast.js'], false, reject, resolve)
    })
}

function loadSDK3(){
    return new Promise((resolve, reject) => {
        if(window.google && window.google.ima){
            return resolve()
        }

        if(sdk3_try > 1){
            return reject(new Error('IMA SDK load failed after multiple attempts'))
        }

        sdk3_try++

        Utils.putScriptAsync(['https://imasdk.googleapis.com/js/sdkloader/ima3.js'], false, reject, resolve)
    })
}

function buildUrl(url){
    let movie        = Storage.get('activity', '{}').movie
    let movie_genres = []
    let movie_id     = movie ? movie.id : 0
    let movie_imdb   = movie ? movie.imdb_id : ''
    let movie_type   = movie ? (movie.original_name ? 'tv' : 'movie') : 'movie'

    try{
        movie_genres = movie.genres.map(g=>g.id)
    }
    catch(e){}

    let pixel_ratio = window.devicePixelRatio || 1

    let u = url.replace('{RANDOM}',Math.round(Date.now() * Math.random()))
        u = u.replace(/{TIME}/g,Date.now())
        u = u.replace(/{WIDTH}/g, Math.round(window.innerWidth * pixel_ratio))
        u = u.replace(/{HEIGHT}/g, Math.round(window.innerHeight * pixel_ratio))
        u = u.replace(/{PLATFORM}/g, Platform.get())
        u = u.replace(/{UID}/g, encodeURIComponent(getUid()))
        u = u.replace(/{PIXEL}/g, pixel_ratio)
        u = u.replace(/{GUID}/g, encodeURIComponent(getGuid()))
        u = u.replace(/{MOVIE_ID}/g, movie_id)
        u = u.replace(/{MOVIE_GENRES}/g, movie_genres.join(','))
        u = u.replace(/{MOVIE_IMDB}/g, movie_imdb)
        u = u.replace(/{MOVIE_TYPE}/g, movie_type)
        u = u.replace(/{SCREEN}/g, encodeURIComponent(Platform.screen('tv') ? 'tv' : 'mobile'))

    return u
}

function getGuid() {
    let guid = Storage.get('vast_device_guid', '')

    if(!guid || guid.indexOf('00000000') === 0){
        guid = Utils.guid()

        Storage.set('vast_device_guid', guid)
    }

    return guid
}

function getUid(){
    let uid = Storage.get('vast_device_uid', '')

    if(!uid){
        uid = Utils.uid(15)

        Storage.set('vast_device_uid', uid)
    }

    return uid
}

function getMediaType(player_data){
    let is_torrent  = Boolean(player_data.torrent_hash && Torserver.ip() && player_data.url.indexOf(Torserver.ip()) > -1)
    let is_youtube  = Boolean(player_data.youtube && Activity.active().component == 'full' && player_data.url.indexOf('youtube.com') > -1)
    let is_continue = Boolean(player_data.continue_play && Lampa.PlayerPlaylist.get().length > 0 && Lampa.PlayerPlaylist.get().indexOf(player_data) > -1)

    return {
        iptv: player_data.iptv,
        torrent: is_torrent,
        youtube: is_youtube,
        continue: is_continue,
        any: is_torrent || is_youtube || is_continue || player_data.iptv
    }
}

function canShow(player_data){
    let player_type = getMediaType(player_data)

    let ignore = window.lampa_settings.developer.ads ? false : Account.hasPremium() || Personal.confirm()

    return player_type.any ? false : !ignore
}

function metric(stat_name, method, ad_name){
    if(ad_name == 'plugin'){
        let activity = Storage.get('activity', '{}')

        if(activity.component){
            ad_name = activity.component
        }

        Metric.counter('ad_'+stat_name+'_plugin', ad_name, method, Platform.screen('tv') ? 'tv' : 'mobile')
    }
    else{
        Metric.counter('ad_'+stat_name, ad_name, method, Platform.screen('tv') ? 'tv' : 'mobile')
    }
}

export default {
    loadSDK,
    loadSDK2,
    loadSDK3,
    buildUrl,
    getGuid,
    getUid,
    getMediaType,
    canShow,
    metric
}