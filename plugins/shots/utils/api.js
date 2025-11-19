function url(u){
    return 'http://localhost:3100/api/shots/' + u
    return Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/shots/' + u
}

function params(timeout = 15000) {
    return {
        headers: {
            token: Lampa.Account.Permit.account.token,
            profile: Lampa.Account.Permit.account.profile.id
        },
        timeout: timeout
    }
}

function uploadRequest(data, onsuccess, onerror) {
    Lampa.Network.silent(url('upload-request'), onsuccess, onerror, data, params())
}

function uploadNotify(data, onsuccess, onerror) {
    Lampa.Network.silent(url('upload-notify'), onsuccess, onerror, data, params())
}

function videoStatus(id, onsuccess, onerror) {
    Lampa.Network.silent(url('video-status/' + id), onsuccess, onerror, null, params(5000))
}

function shotsList(type, page = 1, onsuccess, onerror) {
    Lampa.Network.silent(url('list/' + type + '?page=' + page), onsuccess, onerror, null, params(5000))
}

function shotsLike(id, type ,onsuccess, onerror) {
    Lampa.Network.silent(url('like/' + id + '/' + type), onsuccess, onerror, null, params(5000))
}

function shotsFavorite(type, shot, onsuccess, onerror) {
    Lampa.Network.silent(url('favorite'), onsuccess, onerror, {
        type: type,
        shot: shot
    }, params(5000))
}

export default {
    uploadRequest,
    uploadNotify,
    videoStatus,
    shotsList,
    shotsLike,
    shotsFavorite
}