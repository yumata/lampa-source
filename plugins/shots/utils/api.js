function url(u){
    //return 'http://localhost:3100/api/shots/' + u
    return Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/shots/' + u
}

function params(timeout = 15000) {
    if(!Lampa.Account.Permit.account.token) return {timeout: timeout}

    return {
        headers: {
            token: Lampa.Account.Permit.account.token,
            profile: Lampa.Account.Permit.account.profile.id
        },
        timeout: timeout
    }
}

function cache(toparams, life = 60){
    toparams.cache = {
        life: life
    }
    return toparams
}

function uploadRequest(data, onsuccess, onerror) {
    Lampa.Network.silent(url('upload-request'), onsuccess, onerror, data, params())
}

function uploadNotify(data, onsuccess, onerror) {
    Lampa.Network.silent(url('upload-notify'), onsuccess, onerror, data, params())
}

function uploadStatus(id, onsuccess, onerror) {
    Lampa.Network.silent(url('upload-status/' + id), onsuccess, onerror, null, params(5000))
}

function shotsVideo(id, onsuccess, onerror) {
    Lampa.Network.silent(url('video/' + id), onsuccess, onerror, null, params(5000))
}

function shotsList(type, page = 1, onsuccess, onerror) {
    Lampa.Network.silent(url('list/' + type + '?page=' + page), onsuccess, onerror, null, params(5000))
}

function shotsCard(card, page = 1, onsuccess, onerror) {
    Lampa.Network.silent(url('card/' + card.id + '/' + (card.original_name ? 'tv' : 'movie') + '?page=' + page), onsuccess, onerror, null, cache(params(5000), 60 * 10)) // на 10 часов
}

function shotsLiked(id, type ,onsuccess, onerror) {
    Lampa.Network.silent(url('liked'), onsuccess, onerror, {
        id,
        type
    }, params(5000))
}

function shotsBlock(id, onsuccess, onerror) {
    Lampa.Network.silent(url('block'), onsuccess, onerror, {id}, params())
}

function shotsReport(id, onsuccess, onerror) {
    Lampa.Network.silent(url('report'), onsuccess, onerror, {id}, params())
}

function shotsDelete(id, onsuccess, onerror) {
    Lampa.Network.silent(url('delete'), onsuccess, onerror, {id}, params())
}

function shotsFavorite(action, shot, onsuccess, onerror) {
    Lampa.Network.silent(url('favorite'), onsuccess, onerror, {
        sid: shot.id,
        card_title: shot.card_title,
        card_poster: shot.card_poster,
        action
    }, params(5000))
}

function lenta(page = 1, onsuccess) {
    Lampa.Network.silent(url('lenta?page=' + page), (result)=>{
        onsuccess(result.results)
    }, ()=>{
        onsuccess([])
    }, null, params(10000))
}

export default {
    uploadRequest,
    uploadNotify,
    uploadStatus,
    shotsList,
    shotsLiked,
    shotsFavorite,
    shotsVideo,
    shotsBlock,
    shotsReport,
    shotsDelete,
    shotsCard,
    lenta
}