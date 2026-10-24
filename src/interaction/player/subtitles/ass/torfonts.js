import Torserver from '../../../torserver'

/**
 * Доступ к файлам шрифтов торрента через TorrServer: список файлов, адрес и чтение диапазонов
 */

function base(){
    return String(Torserver.url() || '').replace(/\/+$/, '')
}

function listFiles(hash){
    return fetch(base() + '/torrents', {
        method: 'POST',
        body: JSON.stringify({action: 'get', hash: hash})
    }).then(r=>{
        if(!r.ok) throw new Error('torrents ' + r.status)

        return r.json()
    }).then(json=>{
        return (json.file_stats || []).map(f=> ({id: f.id, path: f.path, length: f.length}))
    })
}

/**
 * Адрес файла как обычного потока (без gst-обработки)
 */
function url(hash, file){
    let name = String(file.path || '').split('/').pop()

    return base() + '/stream/' + encodeURIComponent(name) + '?link=' + hash + '&index=' + file.id + '&play'
}

function range(link, start, end){
    if(end <= start) return Promise.resolve(new Uint8Array(0))

    // cache: no-store - чтобы не получить из кэша браузера ответ, полученный в момент, когда сервер ещё не отдавал данные
    return fetch(link, {cache: 'no-store', headers: {Range: 'bytes=' + start + '-' + (end - 1)}}).then(r=>{
        if(!r.ok) throw new Error('range ' + r.status)

        return r.arrayBuffer().then(buf=>{
            let bytes = new Uint8Array(buf)

            // сервер проигнорировал Range и вернул файл целиком
            if(r.status === 200 && (start > 0 || bytes.length > end - start)) return bytes.subarray(start, end)

            return bytes
        })
    })
}

/**
 * Файл целиком (запасной путь, если чтение по диапазонам дало неполные данные)
 */
function full(link){
    return fetch(link, {cache: 'no-store'}).then(r=>{
        if(!r.ok) throw new Error('full ' + r.status)

        return r.arrayBuffer()
    }).then(buf=> new Uint8Array(buf))
}

export default {
    listFiles,
    url,
    range,
    full
}
