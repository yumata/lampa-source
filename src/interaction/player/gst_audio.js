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
 */

let probe_net = new Reguest()
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

function start(data){
    stop()

    if(!isGst(data) || data.voiceovers || !Torserver.url()) return

    let id = SubsTorserver.fileIndex(data)

    if(id < 0) return

    let mine = session

    probe_net.timeout(60000)

    probe_net.silent(Torserver.url() + '/gst/' + encodeURIComponent(data.torrent_hash) + '/probe?index=' + id, (json)=>{
        if(mine !== session) return

        let probe = parseGst(json)
        let audio = probe ? probe.tracks.filter(tr=>tr.type == 'audio') : []

        if(audio.length < 2) return

        let selected = currentAudio(data.url)

        if(!audio[selected]) selected = 0

        // onSelect у пункта не задаём: Select вызвал бы его вместо обработчика панели (отметка и возврат фокуса).
        // Панель включает дорожку через enabled = true, как у HLS-дорожек (video/hls.js)
        let tracks = audio.map((tr, index)=>{
            let item = {
                language: tr.lang ? languageName(tr.lang, Lang.translate, '') : '',
                label: trackLabel(tr),
                selected: index == selected,
                ignore_translate: true
            }

            Object.defineProperty(item, 'enabled', {
                set: (v)=>{
                    if(!v || index == selected || mine !== session) return

                    selected = index

                    switchAudio(data, index)
                },
                get: ()=> index == selected
            })

            return item
        })

        active = true

        Panel.setTracks(tracks)
    }, false, false, {dataType: 'json'})
}

export default {
    init,
    isActive
}
