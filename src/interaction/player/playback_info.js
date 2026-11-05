import Reguest from '../../utils/reguest'
import Utils from '../../utils/utils'
import Lang from '../../core/lang'
import Controller from '../../core/controller'
import Torserver from '../torserver'
import Player from '../player'
import Panel from './panel'
import Video from './video'
import SubsTorserver from './subtitles/torserver'
import {languageName, codecName, channelLayout} from './track_info'

/**
 * Информация о воспроизведении (только для торрентов).
 * Полупрозрачное окно поверх видео: вид потока TorrServer, файлы торрента,
 * видеодорожки и связанные с ними аудио и субтитры (кодеки, разрешение, битрейт).
 *
 * Источники данных:
 *  - POST /torrents {action:'get'}   - список файлов торрента
 *  - GET  /gst/{hash}/probe?index=N  - дорожки файла (режим транскодирования, gstreamer)
 *  - GET  /ffp/{hash}/{id}           - ffprobe (обычный режим, либо запасной вариант)
 *  - GET  master.m3u8                - параметры HLS-потока после транскодирования
 *  - GET  /subs/{hash}/{id}          - внешние субтитры торрента
 */

let html
let body
let opened  = false
let title
let hint
let hidden  = []
let prev_controller
let session = 0
let requests = []

// слишком длинные списки внешних дорожек обрезаем (окно прокручивается стрелками вверх/вниз)
const MAX_EXTERNAL = 40

const AUDIO_EXT = ['mka', 'ac3', 'eac3', 'dts', 'dtshd', 'thd', 'truehd', 'flac', 'aac', 'm4a', 'mp3', 'opus', 'ogg', 'wav']
const SUBS_EXT  = ['ass', 'ssa', 'srt', 'vtt', 'sub', 'sup']

const VIDEO_CODECS = {
    'video/x-h264': 'H.264', 'video/x-h265': 'HEVC (H.265)', 'video/x-av1': 'AV1',
    'video/x-vp9': 'VP9', 'video/x-vp8': 'VP8', 'video/x-wmv': 'WMV', 'video/x-divx': 'MPEG-4',
    h264: 'H.264', hevc: 'HEVC (H.265)', av1: 'AV1', vp9: 'VP9', vp8: 'VP8', mpeg4: 'MPEG-4',
    mpeg2video: 'MPEG-2', vc1: 'VC-1', wmv3: 'WMV', msmpeg4v3: 'MPEG-4'
}

const HLS_CODECS = [
    [/^(avc1|avc3)/, 'H.264'], [/^(hvc1|hev1)/, 'HEVC (H.265)'], [/^av01/, 'AV1'], [/^vp09/, 'VP9'],
    [/^mp4a\.40\.2$/, 'AAC-LC'], [/^mp4a\.40\.5$/, 'HE-AAC'], [/^mp4a\.40\.29$/, 'HE-AACv2'],
    [/^mp4a/, 'AAC'], [/^ac-3$/, 'Dolby Digital'], [/^ec-3$/, 'Dolby Digital+'],
    [/^opus$/, 'Opus'], [/^flac$/, 'FLAC']
]

function t(key){
    return Lang.translate(key)
}

function init(){
    html  = $('<div class="playback-info"></div>')
    title = $('<div class="playback-info__title"></div>')
    body  = $('<div class="playback-info__body"></div>')
    hint  = $('<div class="playback-info__hint"></div>')

    let close_button = $('<div class="playback-info__close">&#10005;</div>').on('click', ()=> close())

    html.append($('<div class="playback-info__top"></div>').append(title, close_button), body, hint)

    Controller.add('player_playback_info', {
        invisible: true,
        toggle: ()=>{
            Controller.collectionSet(html)
        },
        up: ()=> scroll(-1),
        down: ()=> scroll(1),
        enter: ()=> close(),
        back: ()=> close()
    })

    Panel.listener.follow('playinfo', toggle)

    // новая серия или закрытие плеера: окно закрываем, контроллер не трогаем
    Player.listener.follow('start', ()=> close(false))
    Player.listener.follow('destroy', ()=> close(false))
}

function render(){
    return html
}

function isOpen(){
    return opened
}

function toggle(){
    if(opened) close()
    else open()
}

function scroll(dir){
    let step = Math.max(40, body.height() * 0.6)

    body.scrollTop(body.scrollTop() + dir * step)
}

/** Скрыть все элементы управления плеера, кроме видео и этого окна */
function hideControls(){
    showControls()

    html.parent().children().each((i, el)=>{
        if(el === html[0] || el === Video.render()[0]) return

        if($(el).css('display') !== 'none'){
            $(el).addClass('playback-info--hidden')

            hidden.push(el)
        }
    })
}

function showControls(){
    hidden.forEach(el=> $(el).removeClass('playback-info--hidden'))

    hidden = []
}

function open(){
    opened = true

    prev_controller = Controller.enabled().name

    title.text(t('player_playback_info'))
    hint.text(t('playback_info_hint'))

    hideControls()

    html.addClass('playback-info--visible')

    body.scrollTop(0)
    body.empty().append(note(t('loading').replace(/\.+$/, '') + '...'))

    Controller.toggle('player_playback_info')

    load()
}

/**
 * @param {boolean} [restore] - вернуть управление плееру (false, если плеер закрывается или меняется серия)
 */
function close(restore){
    let was = opened

    opened = false

    abort()
    showControls()

    html.removeClass('playback-info--visible')

    body.empty()

    if(was && restore !== false && Controller.enabled().name == 'player_playback_info') Controller.toggle('player')
}

function abort(){
    session++

    requests.forEach(r=>{
        try{ r.clear() }
        catch(e){}
    })

    requests = []
}

/* ------------------------------------------------------------------ загрузка */

function request(url, success, fail, post, params){
    let network = new Reguest()

    requests.push(network)

    network.timeout(60000)
    network.silent(url, success, fail, post || false, params || {dataType: 'json'})
}

function load(){
    let data = Player.playdata()

    if(!data || !data.torrent_hash || !Torserver.url()){
        body.empty().append(note(t('playback_info_nodata')))

        return
    }

    let mine = ++session
    let base = Torserver.url()
    let hash = encodeURIComponent(data.torrent_hash)
    let id   = SubsTorserver.fileIndex(data)
    let mode = String(data.url || '').indexOf('/gst/') >= 0 ? 'transcode' : 'direct'

    let state = {data, mode, id, files: [], probe: null, master: null, subs: null}
    let wait  = 0

    let done = ()=>{
        if(mine !== session) return

        wait--

        if(wait <= 0) draw(state)
    }

    // 1. файлы торрента
    wait++

    request(base + '/torrents', (json)=>{
        state.files = parseFiles(json)

        done()
    }, done, JSON.stringify({action: 'get', hash: data.torrent_hash}))

    // 2. дорожки файла
    if(id >= 0){
        wait++

        let gst = ()=> request(base + '/gst/' + hash + '/probe?index=' + id, (json)=>{
            state.probe = parseGst(json)

            done()
        }, done)

        if(mode == 'transcode') gst()
        else request(base + '/ffp/' + hash + '/' + id, (json)=>{
            state.probe = parseFfprobe(json)

            if(state.probe) done()
            else gst()
        }, gst)
    }

    // 3. параметры HLS потока
    if(mode == 'transcode'){
        wait++

        request(Torserver.toPlayUrl(data.url), (text)=>{
            state.master = parseMaster(text)

            done()
        }, done, false, {dataType: 'text'})
    }

    // 4. внешние субтитры
    if(SubsTorserver.available(data)){
        wait++

        let loader = SubsTorserver.load(data, (list)=>{
            state.subs = list

            done()
        }, done)

        requests.push({clear: ()=> loader.destroy()})
    }
}

/* ------------------------------------------------------------------ разбор ответов */

function parseFiles(json){
    try{
        if(json && Array.isArray(json.file_stats)) return json.file_stats

        if(json && json.data){
            let d = typeof json.data == 'string' ? JSON.parse(json.data) : json.data

            return d && d.TorrServer && Array.isArray(d.TorrServer.Files) ? d.TorrServer.Files : []
        }
    }
    catch(e){}

    return []
}

function capsValue(caps, name){
    let m = new RegExp('(?:^|,\\s*)' + name + '=\\((?:string|int|uint|fraction)\\)([^,]+)').exec(String(caps || ''))

    return m ? m[1].trim() : ''
}

function gstVideoCodec(track){
    let name = VIDEO_CODECS[track.CapsName] || String(track.CapsName || track.Codec || '').replace(/^video\/(x-)?/, '').toUpperCase()
    let profile = capsValue(track.Codec, 'profile').replace(/-/g, ' ').replace(/\b\w/g, c=>c.toUpperCase())
    let level   = capsValue(track.Codec, 'level')

    return {name, profile, level}
}

function gstAudioCodec(track){
    let caps = String(track.CapsName || '')

    if(caps == 'audio/mpeg'){
        let v = capsValue(track.Codec, 'mpegversion')

        return v == '4' ? 'AAC' : v == '1' ? 'MP3' : 'MPEG'
    }

    if(/true-?hd/i.test(caps)) return 'TrueHD'

    return codecName(caps || track.Codec)
}

/** Ответ /gst/{hash}/probe -> общий вид */
function parseGst(json){
    if(!json || !Array.isArray(json.Tracks)) return null

    let tracks = json.Tracks.map(tr=>{
        let type = String(tr.Type || '').toLowerCase()

        if(type.indexOf('sub') == 0) type = 'subtitle'

        let out = {
            type,
            lang: tr.Language || '',
            title: tr.Title || '',
            width: tr.Width || 0,
            height: tr.Height || 0,
            channels: tr.Channels || 0,
            rate: tr.Rate || 0,
            bitrate: 0,
            fps: tr.FrameRateDen ? tr.FrameRateNum / tr.FrameRateDen : 0,
            depth: tr.BitDepth || 0,
            hdr: ''
        }

        if(type == 'video'){
            let c = gstVideoCodec(tr)

            out.codec = c.name
            out.profile = [c.profile, c.level ? 'L' + c.level : ''].filter(Boolean).join(' ')

            if(tr.IsDolbyVision) out.hdr = 'Dolby Vision' + (tr.DolbyVisionProfile ? ' P' + tr.DolbyVisionProfile : '')
            else if(/2084/.test(tr.VideoTransfer || tr.Transfer || '')) out.hdr = 'HDR10'
            else if(/b67|hlg/i.test(tr.VideoTransfer || tr.Transfer || '')) out.hdr = 'HLG'
        }
        else if(type == 'audio') out.codec = gstAudioCodec(tr)
        else out.codec = String(tr.CapsName || tr.Codec || '').replace(/^(application|text)\/(x-)?/, '').toUpperCase()

        return out
    })

    return {
        source: 'gst',
        container: String(json.Container || '').replace(/^Matroska$/i, 'Matroska (MKV)'),
        duration: json.DurationNS > 0 ? json.DurationNS / 1e9 : 0,
        size: json.FileSize || 0,
        bitrate: 0,
        tracks
    }
}

function frameRate(value){
    let m = /^(\d+)\/(\d+)$/.exec(String(value || ''))

    return m && parseInt(m[2]) ? parseInt(m[1]) / parseInt(m[2]) : 0
}

/** Ответ /ffp/{hash}/{id} -> общий вид */
function parseFfprobe(json){
    if(!json || !Array.isArray(json.streams)) return null

    let format = json.format || {}

    let tracks = json.streams.map(s=>{
        let tags = s.tags || {}
        let type = s.codec_type

        let out = {
            type,
            lang: tags.language || tags.LANGUAGE || '',
            title: tags.title || tags.TITLE || '',
            width: s.width || 0,
            height: s.height || 0,
            channels: s.channels || 0,
            rate: parseInt(s.sample_rate) || 0,
            bitrate: parseInt(s.bit_rate || tags.BPS || tags['BPS-eng']) || 0,
            fps: frameRate(s.avg_frame_rate),
            depth: parseInt(s.bits_per_raw_sample) || 0,
            hdr: '',
            profile: s.profile && s.profile != 'unknown' ? s.profile + (s.level > 0 && type == 'video' ? ' L' + (s.level / 10).toFixed(1) : '') : ''
        }

        if(type == 'video'){
            out.codec = VIDEO_CODECS[s.codec_name] || String(s.codec_name || '').toUpperCase()

            if(/smpte2084/.test(s.color_transfer || '')) out.hdr = 'HDR10'
            else if(/arib-std-b67/.test(s.color_transfer || '')) out.hdr = 'HLG'
        }
        else if(type == 'audio') out.codec = codecName(s.codec_name)
        else out.codec = String(s.codec_name || '').toUpperCase()

        return out
    })

    return {
        source: 'ffprobe',
        container: String(format.format_long_name || format.format_name || ''),
        duration: parseFloat(format.duration) || 0,
        size: parseInt(format.size) || 0,
        bitrate: parseInt(format.bit_rate) || 0,
        tracks
    }
}

function hlsAttrs(line){
    let out = {}
    let re  = /([A-Z0-9-]+)=("[^"]*"|[^,]*)/g
    let m

    while((m = re.exec(line))) out[m[1]] = m[2].replace(/^"|"$/g, '')

    return out
}

/** Мастер-плейлист HLS -> варианты потока */
function parseMaster(text){
    let out = {variants: [], media: []}

    String(text || '').split(/\r?\n/).forEach(line=>{
        if(line.indexOf('#EXT-X-STREAM-INF:') == 0) out.variants.push(hlsAttrs(line.slice(18)))
        else if(line.indexOf('#EXT-X-MEDIA:') == 0) out.media.push(hlsAttrs(line.slice(13)))
    })

    return out.variants.length || out.media.length ? out : null
}

/* ------------------------------------------------------------------ форматирование */

function bitrateText(bps){
    if(!bps) return ''

    return bps >= 1e6 ? (bps / 1e6).toFixed(2) + ' ' + t('speed_mb') : Math.round(bps / 1000) + ' ' + t('playback_info_kbps')
}

function hlsCodecsText(codecs){
    return String(codecs || '').split(',').map(c=>{
        c = c.trim()

        let found = HLS_CODECS.find(h=>h[0].test(c))

        return found ? found[1] + ' (' + c + ')' : c
    }).filter(Boolean).join(' + ')
}

function baseName(path){
    return String(path || '').replace(/\\/g, '/').split('/').pop()
}

function stripExt(name){
    return name.replace(/\.[^./]+$/, '')
}

function extOf(name){
    let m = /\.([^./]+)$/.exec(name)

    return m ? m[1].toLowerCase() : ''
}

function fileSize(file){
    return file && file.length ? Utils.bytesToSize(file.length) : ''
}

/**
 * Файлы торрента, относящиеся к видео: имя начинается с имени видеофайла
 * (после него должен идти разделитель, чтобы Ep.01 не совпал с Ep.011)
 */
function relatedFiles(files, id, exts){
    let video = files.find(f=>f.id == id)

    if(!video) return []

    let vbase = stripExt(baseName(video.path)).toLowerCase()

    return files.filter(f=>{
        if(f.id == id) return false

        let name = baseName(f.path).toLowerCase()

        if(exts.indexOf(extOf(name)) < 0) return false

        return name.indexOf(vbase) === 0 && /[^a-z0-9]/i.test(name.charAt(vbase.length))
    })
}

/** Подпапка внешнего файла относительно папки видео (например Int Sub/Ara) */
function subDir(file, state){
    let video = state.files.find(f=>f.id == state.id)
    let dir   = p=>String(p || '').replace(/\\/g, '/').split('/').slice(0, -1).join('/')
    let vdir  = video ? dir(video.path) : ''
    let fdir  = dir(file.path)

    return vdir && fdir.indexOf(vdir) === 0 ? fdir.slice(vdir.length).replace(/^\//, '') : fdir
}

/** Часть имени внешнего файла после имени видео (обычно название озвучки или студии) */
function tailName(file, state){
    let video = state.files.find(f=>f.id == state.id)
    let name  = stripExt(baseName(file.path))
    let vbase = video ? stripExt(baseName(video.path)) : ''
    let tail  = vbase && name.toLowerCase().indexOf(vbase.toLowerCase()) === 0 ? name.slice(vbase.length).replace(/^[\s._-]+/, '') : ''

    return tail || name
}

function fileIdFromUrl(url){
    let m = /[?&]index=(\d+)/.exec(String(url || ''))

    return m ? parseInt(m[1]) : -1
}

/* ------------------------------------------------------------------ отрисовка */

function head(text){
    return $('<div class="playback-info__head"></div>').text(text)
}

function note(text){
    return $('<div class="playback-info__note"></div>').text(text)
}

function line(label, value, mod){
    if(value === '' || value === undefined || value === null) return ''

    return $('<div class="playback-info__line' + (mod ? ' ' + mod : '') + '"></div>')
        .append($('<span class="playback-info__label"></span>').text(label))
        .append($('<span class="playback-info__value"></span>').text(value))
}

function sub(text){
    return $('<div class="playback-info__sub"></div>').text(text)
}

function more(root, total){
    if(total > MAX_EXTERNAL) root.append(note('+' + (total - MAX_EXTERNAL)))
}

function trackLabel(tr, num){
    let lang = tr.lang ? languageName(tr.lang, Lang.translate, '') : ''

    return t('playback_info_track') + ' ' + num + (lang ? ' · ' + lang : '')
}

function audioText(tr){
    let parts = [tr.codec, channelLayout(tr.channels), tr.rate ? tr.rate / 1000 + ' kHz' : '', bitrateText(tr.bitrate)]

    if(tr.title) parts.push(tr.title)

    return parts.filter(Boolean).join(' · ')
}

function videoParts(tr, probe){
    let size = tr.width && tr.height ? tr.width + 'x' + tr.height : ''
    let bitrate = bitrateText(tr.bitrate)

    // битрейт потока не всегда известен: тогда показываем средний по файлу
    if(!bitrate && probe.size && probe.duration) bitrate = '~' + bitrateText(probe.size * 8 / probe.duration) + ' (' + t('playback_info_average') + ')'

    return {
        codec: [tr.codec, tr.profile].filter(Boolean).join(' '),
        size,
        fps: tr.fps ? parseFloat(tr.fps.toFixed(3)) + ' fps' : '',
        depth: tr.depth ? tr.depth + ' bit' : '',
        hdr: tr.hdr,
        bitrate
    }
}

function drawVideo(root, tr, num, probe){
    let v = videoParts(tr, probe)

    root.append(sub(t('playback_info_video') + ' #' + num))
    root.append(line(t('playback_info_codec'), v.codec))
    root.append(line(t('playback_info_resolution'), [v.size, v.fps].filter(Boolean).join(' · ')))
    root.append(line(t('torrent_item_bitrate'), v.bitrate))
    root.append(line(t('playback_info_color'), [v.depth, v.hdr].filter(Boolean).join(' · ')))
}

function kind(root, text){
    root.append($('<div class="playback-info__kind"></div>').text(text))
}

function fileLabel(id){
    return id !== '' && id !== undefined ? t('playback_info_file') + ' #' + id : ''
}

function drawAudio(root, state, probe){
    let embedded = probe ? probe.tracks.filter(tr=>tr.type == 'audio') : []
    let external = relatedFiles(state.files, state.id, AUDIO_EXT)

    if(!embedded.length && !external.length) return

    root.append(sub(t('playback_info_audio')))

    if(embedded.length){
        kind(root, t('playback_info_embedded'))

        embedded.forEach((tr, i)=>{
            root.append(line(trackLabel(tr, i + 1), audioText(tr), 'playback-info__line--track'))
        })
    }

    if(external.length){
        // отдельного API для аудио нет: файлы торрента подбираются по имени видеофайла
        kind(root, t('playback_info_external_name'))

        external.slice(0, MAX_EXTERNAL).forEach(file=>{
            let name = baseName(file.path)

            root.append(line(fileLabel(file.id), [subDir(file, state), tailName(file, state), extOf(name).toUpperCase(), fileSize(file)].filter(Boolean).join(' · '), 'playback-info__line--track'))
        })

        more(root, external.length)
    }
}

function drawSubs(root, state, probe){
    let embedded = probe ? probe.tracks.filter(tr=>tr.type == 'subtitle') : []
    let external = []
    let source   = 'playback_info_external_name'

    if(state.subs && state.subs.length){
        source   = 'playback_info_external_api'
        external = state.subs.map(s=>{
            let file = state.files.find(f=>f.id == fileIdFromUrl(s.url))

            return {
                id: file ? file.id : '',
                text: [s.label, file ? fileSize(file) : ''].filter(Boolean).join(' · ')
            }
        })
    }
    else{
        external = relatedFiles(state.files, state.id, SUBS_EXT).map(file=>({
            id: file.id,
            text: [subDir(file, state), tailName(file, state), extOf(baseName(file.path)).toUpperCase(), fileSize(file)].filter(Boolean).join(' · ')
        }))
    }

    if(!embedded.length && !external.length) return

    root.append(sub(t('playback_info_subs')))

    if(embedded.length){
        kind(root, t('playback_info_embedded'))

        embedded.forEach((tr, i)=>{
            root.append(line(trackLabel(tr, i + 1), [tr.codec, tr.title].filter(Boolean).join(' · '), 'playback-info__line--track'))
        })
    }

    if(external.length){
        kind(root, t(source))

        external.slice(0, MAX_EXTERNAL).forEach(item=>{
            root.append(line(fileLabel(item.id), item.text, 'playback-info__line--track'))
        })

        more(root, external.length)
    }
}

function column(){
    return $('<div class="playback-info__col"></div>')
}

function draw(state){
    body.empty()

    let probe   = state.probe
    let file    = state.files.find(f=>f.id == state.id)
    let variant = state.master && state.master.variants[0]

    let left  = column()
    let right = column()

    body.append(left, right)

    // вид потока TorrServer
    left.append(line(t('playback_info_stream'), t(state.mode == 'transcode' ? 'playback_info_transcode' : 'playback_info_direct')))

    if(variant){
        let avg  = parseInt(variant['AVERAGE-BANDWIDTH']) || 0
        let peak = parseInt(variant.BANDWIDTH) || 0
        let out  = [variant.RESOLUTION, hlsCodecsText(variant.CODECS), bitrateText(avg || peak)].filter(Boolean).join(' · ')

        left.append(line(t('playback_info_output'), out))
    }

    // файл торрента
    if(file){
        left.append(line(t('playback_info_file'), '#' + file.id + ' · ' + baseName(file.path) + (file.length ? ' · ' + fileSize(file) : '')))
    }

    if(probe){
        left.append(line(t('playback_info_container'), probe.container))

        if(probe.duration) left.append(line(t('playback_info_duration'), Utils.secondsToTime(Math.round(probe.duration))))
    }

    // дорожки: для каждого видео - его аудио и субтитры
    let videos = probe ? probe.tracks.filter(tr=>tr.type == 'video') : []

    if(videos.length){
        videos.forEach((tr, i)=>{
            let box = $('<div class="playback-info__track"></div>')

            drawVideo(box, tr, i + 1, probe)
            drawAudio(box, state, probe)
            drawSubs(box, state, probe)

            right.append(box)
        })
    }
    else{
        let box = $('<div class="playback-info__track"></div>')

        // данных о дорожках нет (нет ffprobe или gstreamer): показываем, что известно
        if(variant && variant.RESOLUTION){
            box.append(sub(t('playback_info_video')))
            box.append(line(t('playback_info_resolution'), variant.RESOLUTION + (variant['FRAME-RATE'] ? ' · ' + parseFloat(variant['FRAME-RATE']).toFixed(3) + ' fps' : '')))
        }

        drawAudio(box, state, probe)
        drawSubs(box, state, probe)

        box.append(note(t('playback_info_noprobe')))

        right.append(box)
    }
}

export default {
    init,
    render,
    isOpen,
    open,
    close,
    toggle
}
