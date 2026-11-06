import Reguest from '../../utils/reguest'
import Lang from '../../core/lang'
import Torserver from '../torserver'
import Player from '../player'
import Panel from './panel'
import Video from './video'
import Subtitles from './subtitles'
import SubsTorserver from './subtitles/torserver'
import {languageName, channelLayout} from './track_info'
import {parseGst} from './playback_info'

/**
 * Выбор аудиодорожки при воспроизведении торрента через транскодирование TorrServer (gstreamer).
 * HLS-поток после транскодирования содержит одну аудиодорожку, поэтому список берём из файла:
 *  - GET /gst/{hash}/probe?index=N  - дорожки файла
 * Дорожка задаётся параметром &audio=I в адресе потока (I - номер среди аудиодорожек, с 0).
 * При выборе адрес меняется и перезапускается только видео (как при смене качества), позиция сохраняется.
 *
 * Внешние аудиодорожки (озвучка отдельными файлами в торренте):
 *  - GET /audio/{hash}/{id}  - список аудиофайлов, подходящих к видео с индексом id
 * Такая дорожка включается параметром &audio=1000+N, где N - позиция дорожки в ответе /audio (с 0).
 * Сервер подмешивает файл к потоку и перекодирует звук в AAC, поэтому подходит любой формат.
 */

const EXTERNAL_BASE = 1000

let probe_net = new Reguest()
let audio_net = new Reguest()
let active    = false
let session   = 0
let seek      = null

function init(){
    Player.listener.follow('start', start)
    Player.listener.follow('destroy', stop)
}

/**
 * Список дорожек в панели задан этим модулем: дорожки из видео его не перезаписывают
 * @returns {boolean}
 */
function isActive(){
    return active
}

function isGst(data){
    return Boolean(data && data.torrent_hash && String(data.url || '').indexOf('/gst/') >= 0)
}

function currentAudio(url){
    let m = /[?&]audio=(\d+)/.exec(String(url || ''))

    return m ? parseInt(m[1]) : 0
}

/**
 * Адрес потока с нужной дорожкой: параметр audio заменяется или добавляется
 */
function withAudio(url, index){
    url = String(url || '')

    if(/[?&]audio=\d*/.test(url)) return url.replace(/([?&]audio=)\d*/, '$1' + index)

    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'audio=' + index
}

function seekCancel(){
    if(seek) Video.listener.remove('loadeddata', seek)

    seek = null
}

function stop(){
    session++

    active = false

    probe_net.clear()
    audio_net.clear()

    seekCancel()
}

function trackLabel(tr){
    let parts = [tr.codec, channelLayout(tr.channels), tr.rate ? tr.rate / 1000 + ' kHz' : '']

    if(tr.title) parts.push(tr.title)

    return parts.filter(Boolean).join(' · ')
}

/**
 * Перезапустить видео с другой дорожкой и вернуться на прежнее место
 */
function switchAudio(data, index){
    let video = Video.video()
    let time  = video && video.currentTime > 0 ? video.currentTime : 0

    seekCancel()

    data.url = withAudio(data.url, index)

    // видеоэлемент пересоздаётся: субтитры (в том числе ASS) отвязываем от старого и вернём на новый
    Subtitles.suspend()

    Video.destroy(true)

    if(time > 0){
        seek = ()=>{
            seekCancel()

            Video.to(time)
        }

        Video.listener.follow('loadeddata', seek)
    }

    Video.url(Torserver.toPlayUrl(data.url), true)

    Subtitles.resume(data)
}

/**
 * Внешняя дорожка из ответа /audio в виде пункта меню
 * @param {object} track - элемент ответа сервера {name, title, lang, format}
 */
function externalItem(track){
    let lang  = track.lang && track.lang !== 'und' ? languageName(track.lang, Lang.translate, '') : ''
    let title = String(track.title || track.name || '').replace(/\.[a-z0-9]{2,4}$/i, '')

    return {
        language: lang,
        name: '[ext]',
        label: lang ? '[ext] ' + title : title,
        extra: {
            fourCC: String(track.format || '').toUpperCase()
        }
    }
}

/**
 * Показать выбор дорожек: дорожки файла и внешние
 * @param {object} data - данные плеера
 * @param {Array} embedded - аудиодорожки файла (probe)
 * @param {Array} external - внешние дорожки (/audio)
 * @param {number} mine - номер сеанса, по нему отбрасываются устаревшие ответы
 */
function show(data, embedded, external, mine){
    let items = embedded.map((tr, index)=>({
        audio: index,
        fields: {
            language: tr.lang ? languageName(tr.lang, Lang.translate, '') : '',
            label: trackLabel(tr)
        }
    }))

    // не удалось получить дорожки файла: оставляем пункт для возврата на звук из видео
    if(!items.length && external.length) items.push({audio: 0, fields: {language: '', name: Lang.translate('player_audio_original'), label: ''}})

    external.forEach((track, position)=>{
        items.push({audio: EXTERNAL_BASE + position, fields: externalItem(track)})
    })

    if(items.length < 2) return

    let selected = currentAudio(data.url)

    if(!items.some(item=>item.audio == selected)) selected = items[0].audio

    // onSelect у пункта не задаём: Select вызвал бы его вместо обработчика панели (отметка и возврат фокуса).
    // Панель включает дорожку через enabled = true, как у HLS-дорожек (video/hls.js)
    let tracks = items.map((item)=>{
        let track = Object.assign({
            selected: item.audio == selected,
            ignore_translate: true
        }, item.fields)

        Object.defineProperty(track, 'enabled', {
            set: (v)=>{
                if(!v || item.audio == selected || mine !== session) return

                selected = item.audio

                switchAudio(data, item.audio)
            },
            get: ()=> item.audio == selected
        })

        return track
    })

    active = true

    Panel.setTracks(tracks)
}

function start(data){
    stop()

    if(!isGst(data) || data.voiceovers || !Torserver.url()) return

    let id = SubsTorserver.fileIndex(data)

    if(id < 0) return

    let mine     = session
    let embedded = null
    let external = null

    // дорожки файла и внешние приходят отдельными запросами: показываем, когда есть оба ответа
    let ready = ()=>{
        if(mine !== session || embedded === null || external === null) return

        show(data, embedded, external, mine)
    }

    probe_net.timeout(60000)

    probe_net.silent(Torserver.url() + '/gst/' + encodeURIComponent(data.torrent_hash) + '/probe?index=' + id, (json)=>{
        if(mine !== session) return

        let probe = parseGst(json)

        embedded = probe ? probe.tracks.filter(tr=>tr.type == 'audio') : []

        ready()
    }, ()=>{
        if(mine !== session) return

        embedded = []

        ready()
    }, false, {dataType: 'json'})

    audio_net.timeout(20000)

    audio_net.silent(Torserver.url() + '/audio/' + encodeURIComponent(data.torrent_hash) + '/' + id, (json)=>{
        if(mine !== session) return

        external = Array.isArray(json) ? json.filter(Boolean) : []

        ready()
    }, ()=>{
        // старый TorrServer без /audio: остаются только дорожки файла
        if(mine !== session) return

        external = []

        ready()
    }, false, {dataType: 'json'})
}

export default {
    init,
    isActive
}
