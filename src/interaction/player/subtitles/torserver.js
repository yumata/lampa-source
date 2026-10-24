import Reguest from '../../../utils/reguest'
import Torserver from '../../torserver'

/**
 * Внешние субтитры торрента через API TorrServer: GET /subs/{hash}/{id}
 * Ответ: [{index, name, title, lang, format, url}]
 *   GET {url}&format=original  - файл как есть (ASS остаётся ASS), в UTF-8
 *   GET {url}&format=vtt       - конвертация в WebVTT (без оформления)
 */

/**
 * Индекс файла в торренте из адреса потока (…?link=HASH&index=ID… или …master.m3u8?index=ID…)
 * @param {object} data - данные плеера
 * @returns {number} -1 если не определён
 */
function fileIndex(data){
    let m = /[?&]index=(\d+)/.exec(String(data.url || ''))

    if(m) return parseInt(m[1])

    return typeof data.id === 'number' ? data.id : -1
}

/**
 * Можно ли запросить субтитры у TorrServer для этих данных
 * @param {object} data
 * @returns {boolean}
 */
function available(data){
    if(!data || !data.torrent_hash) return false

    let ip = Torserver.ip()

    if(!ip) return false

    return String(data.url || '').indexOf(ip) >= 0 && fileIndex(data) >= 0
}

function withParam(url, param){
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + param
}

function cleanTitle(name){
    return String(name || '').replace(/\.(ass|ssa|srt|vtt|sub|sup)$/i, '')
}

/**
 * Преобразовать элемент ответа /subs в элемент списка субтитров плеера
 * ВАЖНО: поле index здесь не используется - плеер сам нумерует дорожки по порядку (0..n-1)
 */
function convert(track, base, hash){
    let format = String(track.format || '').toLowerCase()
    let ass    = format === 'ass' || format === 'ssa'
    let lang   = track.lang && track.lang !== 'und' ? track.lang : ''
    let label  = (lang ? lang.toUpperCase() + ' · ' : '') + cleanTitle(track.title || track.name) + (ass ? ' · ASS' : '')
    let link   = base + track.url

    return {
        label,
        lang,
        format,
        ass,
        hash,
        track: track.index,
        // для ASS отдаём оригинал, чтобы сохранить оформление; остальное - в WebVTT, кодировку приводит сервер
        url: withParam(link, ass ? 'format=original' : 'format=vtt'),
        // запасной вариант без оформления (режим «текст»)
        vtt: withParam(link, 'format=vtt')
    }
}

/**
 * Запросить список субтитров
 * @param {object} data - данные плеера (torrent_hash, url)
 * @param {function} success - получает список в формате плеера (может быть пустым)
 * @param {function} [fail] - ошибка запроса (например, старый TorrServer без /subs)
 * @returns {{destroy:function}}
 */
function load(data, success, fail){
    let network = new Reguest()
    let base    = Torserver.url()
    let url     = base + '/subs/' + encodeURIComponent(data.torrent_hash) + '/' + fileIndex(data)

    network.timeout(20000)

    network.silent(url, (json)=>{
        if(!Array.isArray(json)) return fail && fail()

        success(json.filter(t=> t && t.url).map(t=> convert(t, base, data.torrent_hash)))
    }, ()=>{
        if(fail) fail()
    }, false, {dataType: 'json'})

    return {
        destroy: ()=> network.clear()
    }
}

export default {
    available,
    fileIndex,
    load,
    convert
}
