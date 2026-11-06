import Reguest from '../../utils/reguest'
import Lang from '../../core/lang'
import Noty from '../noty'
import Torserver from '../torserver'
import Player from '../player'
import Panel from './panel'
import Video from './video'
import SubsTorserver from './subtitles/torserver'
import {languageName} from './track_info'
import AudioSync from './audio_sync'

/**
 * Внешние аудиодорожки торрента при обычном воспроизведении (/stream, без транскодирования).
 * Транскодирование обрабатывает gst_audio.js, здесь только прямой поток.
 *
 *  - GET /audio/{hash}/{id}  - список аудиофайлов, подходящих к видео с индексом id, у каждого есть url файла
 *
 * Браузерный <video> не умеет подключить отдельный аудиофайл, поэтому файл играет в скрытом <audio>,
 * синхронизированном с видео (audio_sync.js), а звук самого видео выключается.
 * Устройство должно уметь играть формат файла (aac, mp3, opus, flac и т.п.). Если нет, звук возвращается видео.
 */

let net       = new Reguest()
let session   = 0
let active    = false
let externals = []
let own       = null
let placeholder = null
let tracklist = null

function init(){
    Player.listener.follow('start', start)
    Player.listener.follow('destroy', stop)

    // дорожки самого видео браузер отдаёт после загрузки
    Video.listener.follow('tracks', (e)=>{
        own = e.tracks || null

        if(externals.length) show()
    })

    // видеоэлемент пересоздан: внешний звук был привязан к старому, список в панели не трогаем
    Video.listener.follow('destroy', ()=>{
        if(externals.length) release(true)
    })
}

/**
 * Список дорожек в панели задан этим модулем: дорожки из видео его не перезаписывают
 * @returns {boolean}
 */
function isActive(){
    return active
}

function isDirect(data){
    return Boolean(data && data.torrent_hash && String(data.url || '').indexOf('/gst/') < 0)
}

function external(){
    return externals.find(item=>item.playing)
}

function stop(){
    session++

    active = false

    net.clear()

    unwatch()

    AudioSync.stop()

    externals   = []
    own         = null
    placeholder = null
}

/**
 * Внешняя дорожка из ответа /audio в виде пункта меню
 * @param {object} track - элемент ответа сервера {name, title, lang, format, url}
 */
function externalItem(track, base){
    let lang  = track.lang && track.lang !== 'und' ? languageName(track.lang, Lang.translate, '') : ''
    let title = String(track.title || track.name || '').replace(/\.[a-z0-9]{2,4}$/i, '')

    let item = {
        language: lang,
        name: '[ext]',
        label: lang ? '[ext] ' + title : title,
        extra: {
            fourCC: String(track.format || '').toUpperCase()
        },
        ignore_translate: true,
        src: track.url ? base + track.url : '',
        playing: false,
        selected: false
    }

    // Панель включает дорожку через enabled = true (onSelect у пункта Select вызвал бы вместо обработчика панели)
    Object.defineProperty(item, 'enabled', {
        set: (v)=>{
            if(v) play(item)
        },
        get: ()=> item.playing
    })

    return item
}

/**
 * Пункт «Оригинал», если браузер не отдаёт дорожки видео
 */
function originalItem(){
    let item = {
        name: Lang.translate('player_audio_original'),
        ignore_translate: true,
        selected: true
    }

    Object.defineProperty(item, 'enabled', {
        set: (v)=>{
            if(v) release()
        },
        get: ()=> !external()
    })

    return item
}

function ownTracks(){
    let video = Video.video()
    let list  = own && own.length ? own : (video && video.audioTracks && video.audioTracks.length ? video.audioTracks : [])

    return Array.prototype.slice.call(list)
}

/**
 * Показать выбор дорожек: звук видео и внешние
 */
function show(){
    let playing = Boolean(external())
    let list    = ownTracks()

    if(!list.length){
        if(!placeholder) placeholder = originalItem()

        placeholder.selected = !playing

        list = [placeholder]
    }
    else list.forEach(track=>{ track.selected = !playing && Boolean(track.enabled) })

    externals.forEach(item=>{ item.selected = item.playing })

    active = true

    watch()

    Panel.setTracks(list.concat(externals))
}

/**
 * Если пользователь выбрал дорожку самого видео, внешняя выключается
 */
function onChange(){
    let list = ownTracks()

    if(external() && list.some(track=>track.enabled)) release()
}

function watch(){
    let video = Video.video()
    let list  = video && video.audioTracks

    if(list === tracklist) return

    unwatch()

    if(list && list.addEventListener){
        tracklist = list

        list.addEventListener('change', onChange)
    }
}

function unwatch(){
    if(tracklist && tracklist.removeEventListener) tracklist.removeEventListener('change', onChange)

    tracklist = null
}

/**
 * Включить внешнюю дорожку
 */
function play(item){
    if(!item.src || item.playing) return

    externals.forEach(e=> e.playing = false)

    item.playing = true

    AudioSync.start(item.src, ()=>{
        externals.forEach(e=> e.playing = false)

        Noty.show(Lang.translate('player_audio_external_error'))

        show()
    })
}

/**
 * Выключить внешнюю дорожку, вернуть звук видео
 * @param {boolean} [silent] - не обновлять список в панели (видео уничтожается)
 */
function release(silent){
    externals.forEach((e)=>{
        e.playing  = false
        e.selected = false
    })

    if(placeholder) placeholder.selected = true

    AudioSync.stop()

    if(silent) unwatch()
    else if(externals.length) show()
}

function start(data){
    stop()

    if(!isDirect(data) || data.voiceovers || !Torserver.url() || !SubsTorserver.available(data)) return

    let mine = session
    let base = Torserver.url()

    net.timeout(20000)

    net.silent(base + '/audio/' + encodeURIComponent(data.torrent_hash) + '/' + SubsTorserver.fileIndex(data), (json)=>{
        if(mine !== session || !Array.isArray(json) || !json.length) return

        externals = json.filter(Boolean).map(track=>externalItem(track, base))

        show()
    }, ()=>{
        // старый TorrServer без /audio: плеер работает как раньше
    }, false, {dataType: 'json'})
}

export default {
    init,
    isActive
}
