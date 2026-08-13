import Video from './player/video'
import Panel from './player/panel'
import Info from './player/info'
import Controller from '../core/controller'
import Template from './template'
import Utils from '../utils/utils'
import Playlist from './player/playlist'
import Storage from '../core/storage/storage'
import Platform from '../core/platform'
import Screensaver from './screensaver'
import Torserver from './torserver'
import Android from '../core/android'
import Broadcast from './broadcast'
import Select from './select'
import Subscribe from '../utils/subscribe'
import Disclaimer from './player/disclaimer'
import Noty from '../interaction/noty'
import Lang from '../core/lang'
import Arrays from '../utils/arrays'
import Background from './background'
import TV from './player/iptv' 
import Preroll from './advert/preroll'
import Footer from './player/footer'
import Segments from './player/segments'
import ExternalPlayer from '../core/externalPlayer'
import InfusePlayer from '../core/infusePlayer'
import Agent from './player/agent'
import Charts from './player/charts'
import Chat from './player/chat'
import Skip from './player/skip'
import Timeline from './player/timeline'
import Subtitles from './player/subtitles'
import Error from './player/error'
import {tracksFromFfprobe} from './player/track_info'

let html
let listener = Subscribe()

let callback
let work = false
let launch_player
let wait_for_loading_url = false
let wait_loading = false
let is_opened = false

let viewing = {
    time: 0,
    difference: 0,
    current: 0
}

/**
 * Подписываемся на события
 */

function init(){
    Panel.init()
    Video.init()
    Info.init()
    Footer.init()
    TV.init()
    Agent.init()
    Chat.init()
    Charts.init()
    Skip.init()
    Timeline.init()
    Playlist.init()
    Segments.init()
    Disclaimer.init()
    Subtitles.init()
    Error.init()

    html = Template.get('player')
    html.append(Video.render())
    html.append(Panel.render())
    html.append(Info.render())
    html.append(Footer.render())
    html.append(Chat.render())
    html.append(Skip.render())

    let timer_hide_cursor

    /** Скрываем курсор через 3 секунды */
    html.on('mousemove',()=>{
        if(Storage.field('navigation_type') == 'mouse' && !Utils.isTouchDevice()) Panel.mousemove()

        html.css('cursor','auto')

        clearTimeout(timer_hide_cursor)

        timer_hide_cursor = setTimeout(()=>{
            html.css('cursor','none')
        },3000)
    })

    /** Обновляем таймкод */
    Video.listener.follow('timeupdate',(e)=>{
        Screensaver.resetTimer()

        viewing.difference = e.current - viewing.current

        viewing.current = e.current

        if(viewing.difference > 0 && viewing.difference < 3) viewing.time += viewing.difference
    })

    /** Дорожки полученые из видео */
    Video.listener.follow('tracks', (e)=>{
        if(!work.voiceovers) Panel.setTracks(e.tracks)
    })

    /** Ошибка при попытки возпроизвести */
    Video.listener.follow('error', (e)=>{
        // Если есть резервная ссылка, то пробуем её
        if(e.fatal && work.url_reserve){
            Video.destroy(true)

            Video.url(work.url_reserve, true)

            Timeline.resetContinue()

            delete work.url_reserve
        }

        // Если есть резервная ссылка и есть обработчик ошибки, то пробуем её через обработчик
        if(e.fatal && work.error) work.error(work, (reserve_url)=>{
            Video.destroy(true)

            Video.url(reserve_url, true)

            Timeline.resetContinue()
        })
    })

    /** Видео загружено, проверяем нужно ли скрывать кнопку перемотки */
    Video.listener.follow('loadeddata',()=>{
        if(Video.video().duration < 60*3 && work.need_check_live_stream){
            Panel.hideRewind()
        }
    })

    /** Состояние панели, скрыта или нет */
    Panel.listener.follow('visible',(e)=>{
        html.toggleClass('player--panel-visible', e.status)
    })

    /** К концу видео */
    Panel.listener.follow('to_end',(e)=>{
        if(Playlist.canNext()){
            Video.pause()

            Timeline.setEnd()

            Playlist.next()
        }
        else{
            Video.to(-1)
        }
    })

    /** Переключили качеcтво видео */
    Panel.listener.follow('quality',(e)=>{
        Video.destroy(true)

        work.quality_switched = e.name
        work.url = e.url

        Video.url(Torserver.toPlayUrl(e.url), true)

        Timeline.resetContinue()
    })

    /** Переключили поток */
    Panel.listener.follow('flow',(e)=>{
        Video.destroy(true)

        work.flow_switched = e.url
        work.url = e.url

        Video.url(Torserver.toPlayUrl(e.url), true)

        Timeline.resetContinue()
    })

    /** Нажали на кнопку (отправить) */
    Panel.listener.follow('share',(e)=>{
        Broadcast.open({
            type: 'play',
            object: {
                player: work,
                playlist: Playlist.get()
            }
        })
    })

    /** Событие на переключение серии */
    Playlist.listener.follow('select',(e)=>{
        let type = typeof e.item.url
        let call = ()=>{
            let params = Video.saveParams()

            // Нужно текущий плейлист сохранить, чтобы после destroy в плеере остался правильный плейлист
            let playlist = Playlist.get()

            destroy()

            // Помечаем как продолжение воспроизведения
            e.item.continue_play = true

            play(e.item)

            Video.setParams(params)

            Playlist.set(playlist)

            if(e.item.callback) e.item.callback()
        }

        if(type == 'string') call()
        else if(type == 'function' && !wait_for_loading_url){
            Info.loading()

            wait_for_loading_url = true

            e.item.url(call)
        } 
    })

    TV.listener.follow('play',(data)=>{
        TV.locked(data.channel, ()=>{
            Video.destroy()

            Video.url(data.channel.url)

            Controller.toggle('player_tv')
        })
    })

    listener.follow('start', (data)=>{
        Background.theme('black')

        is_opened = true

        // Упрощенный интерфейс для IPTV
        html.toggleClass('tv', Boolean(data.tv))
        // Интерфейс для YouTube
        html.toggleClass('youtube', Boolean(data.url.indexOf('youtube.com') >= 0))

        Storage.set('player_subs_shift_time', '0')

        $('body').append(html)
    })

    listener.follow('ready', (data)=>{
        Video.size(Storage.get('player_size','default'))
        Video.speed(Storage.get('player_speed','default'))
    })
}

/**
 * Переключить контроллер на плеер
 */
function toggle(){
    Controller.add('player',{
        invisible: true,
        toggle: ()=>{
            Panel.hide()
        },
        up: ()=>{
            if(Skip.isActive()) Skip.toggle()
            else Panel.toggle()
        },
        down: ()=>{
            Panel.toggle()
        },
        right: ()=>{
            if(TV.playning()) Panel.toggle()
            else Video.rewind(true)
        },
        left: ()=>{
            if(TV.playning()) Panel.toggle()
            else Video.rewind(false)
        },
        enter: ()=>{
            if(TV.playning()) Panel.toggle()
            else Video.playpause()
        },
        playpause: () => {
            if(!TV.playning()) Video.playpause()
        },
        play: () => {
            if(!TV.playning()) Video.play()
        },
        pause: () => {
            if(!TV.playning()) Video.pause()
        },
        rewindForward: () => {
            if(!TV.playning()) Video.rewind(true)
        },
        rewindBack: () => {
            if(!TV.playning()) Video.rewind(false)
        },
        stop: backward,
        back: backward
    })

    Controller.add('player-loading',{
        invisible: true,
        toggle: ()=>{
            Controller.clear()
            
            Panel.show()
        },
        back: backward
    })

    Controller.toggle('player')
}

/**
 * Закрыть плеер
 * @doc
 * @name close
 * @alias Player
 */

function backward(){
    launch_player = ''

    destroy()

    if(callback) callback()
    else Controller.toggle('content')

    callback = false
}


/**
 * Запустить webos плеер
 * @param {Object} params 
 */
function runWebOSPlayer(params){
    webOS.service.request("luna://com.webos.applicationManager", {
        method: "launch",
        parameters: { 
            "id": params.need, 
            "params": {
                "payload":[
                    {
                        "fullPath": params.url,
                        "artist":"",
                        "subtitle":"",
                        "dlnaInfo":{
                            "flagVal":4096,
                            "cleartextSize":"-1",
                            "contentLength":"-1",
                            "opVal":1,
                            "protocolInfo":"http-get:*:video/x-matroska:DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000",
                            "duration":0
                        },
                        "mediaType":"VIDEO",
                        "thumbnail":"",
                        "deviceType":"DMR",
                        "album":"",
                        "fileName": params.name,
                        "lastPlayPosition": params.position
                    }
                ]
            }
        },
        onSuccess: function () {
            console.log('Player', 'The app is launched');
        },
        onFailure: function (inError) {
            console.log('Player', "Failed to launch the app ("+params.need+"): ", "[" + inError.errorCode + "]: " + inError.errorText);

            if(params.need == 'com.webos.app.photovideo'){
                params.need = 'com.webos.app.smartshare'

                runWebOSPlayer(params)
            }
            else if(params.need == 'com.webos.app.smartshare'){
                params.need = 'com.webos.app.mediadiscovery'

                runWebOSPlayer(params)
            }
        }
    });
}


/**
 * Получить ссылку на внешний плеер
 */
function externalPlayer(player_need, data, players, infuseCallbacks){
    let player   = Storage.field(player_need)
    let url      = encodeURIComponent(Torserver.toPlayUrl(data.url))
    let _url     = encodeURI(Torserver.toPlayUrl(data.url))
    let furl     = Torserver.toPlayUrl(data.url)
    let playlist = data.playlist ? encodeURIComponent(JSON.stringify(data.playlist)) : ''
    let segments = data.segments ? encodeURIComponent(JSON.stringify(data.segments)) : ''

    for(let p in players){
        players[p] = players[p].replace('${url}', url).replace('${_url}', _url).replace('${furl}', furl).replace('${playlist}', playlist).replace('${segments}', segments)
    }

    // Infuse: save_and_play, readable filenames, season playlist
    if(player == 'infuse'){
        InfusePlayer.normalizePlayData(data)

        let customUrl = null

        listener.send('infuse_build_url', {
            data,
            callbacks: infuseCallbacks,
            setUrl: (url) => { customUrl = url }
        })

        if(customUrl) return customUrl

        return InfusePlayer.resolveUrl(data, infuseCallbacks) || players.infuse
    }

    return players[player]
}


function prepareInfuseLaunch(data, player_need, callback, onCancel){
    if(Storage.field(player_need) !== 'infuse') return callback()

    // Торрент + Infuse: всегда play? с position
    if(InfusePlayer.isTorrentStream(data)){
        data.infuse_mode = 'play'
        return callback()
    }

    let setting = Storage.field('infuse_launch_mode') || 'play'

    if(setting !== 'ask'){
        data.infuse_mode = setting
        return callback()
    }

    delete data.infuse_mode

    let enabled = Controller.enabled()

    Select.show({
        title: Lang.translate('title_action_infuse'),
        items: [
            {
                title: Lang.translate('settings_infuse_launch_save_and_play'),
                mode: 'save_and_play'
            },
            {
                title: Lang.translate('settings_infuse_launch_play'),
                mode: 'play'
            }
        ],
        onSelect: (item)=>{
            Controller.toggle(enabled.name)

            data.infuse_mode = item.mode
            callback()

            delete data.infuse_mode
        },
        onBack: ()=>{
            Controller.toggle(enabled.name)

            if(onCancel) onCancel()
        }
    })
}

function launchExternalPlayer(data, player_need, players, infuseCallbacks, onFallback){
    let launch = (external_url)=>{
        if(!external_url) return onFallback ? onFallback() : null

        Preroll.show(data,()=>{
            listener.send('external',data)

            window.location.assign(external_url)
        })
    }

    prepareInfuseLaunch(data, player_need, ()=>{
        launch(externalPlayer(player_need, data, players, infuseCallbacks))
    }, ()=>{
        listener.send('destroy',{})
    })
}

/**
 * Запустить нужный плеер в зависимости от условий
 */
function start(data, need, inner){
    let player_need = 'player' + (need ? '_' + need : '')
    let launchInner = ()=>{
        if(Disclaimer.needs(player_need, launch_player)) Disclaimer.show(inner)
        else inner()
    }

    if(data.launch_player) launch_player = data.launch_player

    if(launch_player == 'lampa' || launch_player == 'inner' || Video.verifyTube(data.url)) launchInner()
    else if(Platform.is('apple')){
        launchExternalPlayer(data, player_need, {
            vlc:        'vlc://${furl}',
            nplayer:    'nplayer-${furl}',
            infuse:     'infuse://x-callback-url/play?url=${url}',
            senplayer:  'senplayer://x-callback-url/play?url=${url}',
            vidhub:     'open-vidhub://x-callback-url/open?&url=${url}',
            svplayer:   'svplayer://x-callback-url/stream?url=${url}',
            tracyplayer:'tracy://open?url=${url}'
        }, null, ()=>{
            if(Storage.field(player_need) == 'ios'){
                html.addClass('player--ios')
                launchInner()
            }
            else launchInner()
        })
    }
    else if(Platform.macOS()){
        launchExternalPlayer(data, player_need, {
            mpv:    'mpv://${_url}',
            iina:   'iina://weblink?url=${url}',
            nplayer:'nplayer-${_url}',
            infuse: 'infuse://x-callback-url/play?url=${url}',
            senplayer: 'senplayer://x-callback-url/play?url=${url}'
        }, null, launchInner)
    }
    else if(Platform.is('apple_tv')){
        let apple_tv_client = Storage.field('apple_tv_client') ?? 'lampa'

        launchExternalPlayer(data, player_need, {
            vlc:        'vlc-x-callback://x-callback-url/stream?url=${url}',
            infuse:     `infuse://x-callback-url/play?x-success=${apple_tv_client}://infuseDidFinish&x-error=${apple_tv_client}://infuseDidFail&url=\${url}&playlist=\${playlist}`,
            senplayer:  'SenPlayer://x-callback-url/play?url=${url}',
            vidhub:     'open-vidhub://x-callback-url/open?url=${url}',
            svplayer:   'svplayer://x-callback-url/stream?url=${url}',
            tracyplayer:'tracy://open?url=${url}',
            tvospro:       'lampa://video?player=tvospro&src=${url}&playlist=${playlist}&segments=${segments}',
            tvos:       'lampa://video?player=tvos&src=${url}&playlist=${playlist}&segments=${segments}',
            tvosl:      'lampa://video?player=tvosav&src=${url}&playlist=${playlist}&segments=${segments}',
            tvosSelect: 'lampa://video?player=lists&src=${url}&playlist=${playlist}&segments=${segments}'
        }, null, launchInner)
    }
    else if(Platform.is('webos') && (Storage.field(player_need) == 'webos' || launch_player == 'webos')){
        Preroll.show(data,()=>{
            runWebOSPlayer({
                need: 'com.webos.app.photovideo',
                url: Torserver.toPlayUrl(data.url),
                name: data.path || data.title,
                position: data.timeline ? (data.timeline.time || -1) : -1
            })

            listener.send('external',data)
        })
    } 
    else if(Platform.is('android') && (Storage.field(player_need) == 'android' || launch_player == 'android' || (data.torrent_hash && !Torserver.gstWork()))){
        data.url   = Torserver.toPlayUrl(data.url)
        data.title = Utils.clearHtmlTags(data.title || '').trim()
        
        if(data.playlist && Array.isArray(data.playlist)){
            data.playlist = data.playlist.filter(p=>typeof p.url == 'string')

            data.playlist.forEach(a=>{
                a.url   = Torserver.toPlayUrl(a.url)
                a.title = Utils.clearHtmlTags(a.title || '').trim()
            })
        }

        Preroll.show(data,()=>{
            data.position = data.timeline ? (data.timeline.time || -1) : -1

            Android.openPlayer(data.url, data)

            listener.send('external',data)
        })
    }
    else if(Platform.desktop() && Storage.field(player_need) == 'other'){
        const path = Storage.field('player_nw_path')
        const supportedTypes = Object.values(ExternalPlayer.PLAYER_TYPES)
        const detectedType = supportedTypes.find(type => path.toLowerCase().indexOf(type) !== -1)

        Preroll.show(data,()=>{
            const url = Torserver.toPlayUrl(data.url)

            if (detectedType) {
                ExternalPlayer.openPlayer(url, data, {
                    type: detectedType,
                    fullscreen: Storage.field('player_external_fullscreen')
                })
            } else {
                const file = require('fs')
                if (file.existsSync(path)) {
                    const spawn = require('child_process').spawn
                    spawn(path, [encodeURI(url)])
                } else {
                    Noty.show(Lang.translate('player_not_found') + ': ' + path)
                }
            }
            listener.send('external', data)
        })
    }
    else launchInner()

    if(data.launch_player) delete data.launch_player
}

/**
 * Получить URL по качеству видео
 * @doc
 * @name getUrlQuality
 * @alias Player
 * @param {object} quality JSON({"480p": "http://example/video.mp4", "720p": {"url": "http://example/video.mp4", "label": "HD"}, "1080p": {"label": "FHD", "call": "{function} - вызвать при выборе"}})
 * @param {boolean} set_better установить лучшее качество, если нет дефолтного
 * @returns {string} URL
 */

function getUrlQuality(quality, set_better = true){
    if(typeof quality !== 'object') return ''

    let url = ''
    
    for(let q in quality){
        let qa = quality[q]
        let qu = typeof qa == 'object' ? qa.url : typeof qa == 'string' ? qa : ''

        if(parseInt(q) == Storage.field('video_quality_default') && qu) return qu
    }
    
    if(!url && set_better){
        let sort_quality = Arrays.getKeys(quality)

        sort_quality.sort(function(a, b) {
            return parseInt(b) - parseInt(a)
        })

        sort_quality.forEach(q=>{
            let qa = quality[q]
            let qu = typeof qa == 'object' ? qa.url : typeof qa == 'string' ? qa : ''

            if(qu && !url) url = qu
        })
    }

    return url
}

/**
 * Запустить плеер
 * @doc
 * @name play
 * @alias Player
 * @param {object} data JSON({"url": "http://example/video.mp4", "quality": {"1080p": "http://example/video.mp4"}, "title": "Video title", "translate": [{"name": "Перевод", "language": "ru", "extra": {"channels": 2}}], "subtitles": [{"url": "http://example/subs.srt", "label": "RU Force"}], "card": "{object} - TMDB Card", "timeline": "{object} - Lampa.Timeline.view", "iptv": "{boolean} - запустить IPTV плеер", "tv": "{boolean} - имитация IPTV", "torrent_hash": "{string}", "playlist": [{"title":"{string} - Серия 1", "url":"{string} - http://example/video.mp4"}]})
 */

function play(data){
    let run = true

    listener.send('create', {data, abort: () => run = false})

    if(!run) return console.log('Player','play aborted by callback')

    // Если это торрент, то увеличиваем таймаут для HLS манифеста, чтобы не было проблем с буферизацией
    if(data.torrent_hash && Torserver.gstWork()) data.hls_manifest_timeout = 60000

    if(data.ffprobe && !Arrays.isArray(data.translate)){
        let tracks = tracksFromFfprobe(data.ffprobe)

        if(tracks.length){
            if(!data.translate || typeof data.translate !== 'object') data.translate = {}
            if(!data.translate.tracks) data.translate.tracks = tracks
        }
    }

    if(data.quality){
        // Если качество одно, то удаляем объект качества, чтобы не показывать панель выбора качества
        if(Arrays.getKeys(data.quality).length == 1) delete data.quality
        else{
            // Если качество несколько, то получаем дефолтное качество
            data.url = getUrlQuality(data.quality, false) || data.url
        }
    }

    let lauch = ()=>{
        // Запоминаем текущий объект, чтобы потом можно было получить его в других методах
        work = data

        // Если есть реклама, то показываем её, затем запускаем плеер
        Preroll.show(data,()=>{
            listener.send('start', data)

            Video.url(Torserver.toPlayUrl(data.url))

            toggle()

            Timeline.needToContinue(toggle)

            listener.send('ready', data)
        })
    }

    if(launch_player) data.launch_player = launch_player

    start(data, data.torrent_hash ? 'torrent' : '', lauch)
}

function iptv(data){
    TV.locked(data, ()=>{
        console.log('Player','play iptv')

        data.iptv        = true //пометка для ведра, что это iptv
        data.iptv_player = true //помечаем как iptv плеер, для него совсем другой интерфейс

        let lauch = ()=>{
            work = data
            
            html.toggleClass('iptv', Boolean(data.iptv))

            listener.send('start',data)

            TV.start(data)

            toggle()

            listener.send('ready',data)
        }

        start(data, 'iptv', ()=>{
            if(data.vast_url) Preroll.show(data,lauch)
            else lauch()
        })
    })
}


/**
 * Установить плейлист
 * @doc
 * @name playlist
 * @alias Player
 * @param {array} data JSON([{"title":"{string} - Серия 1", "url":"{string} - http://example/video.mp4"}])
 */

function playlist(playlist){
    Playlist.set(playlist)
}

/**
 * Установить субтитры для видео
 * @doc
 * @name subtitles
 * @alias Player
 * @param {array} subs JSON([{"index":"{integer}", "label":"{string}", "url":"http://example/subs.srt"}])
 */

function subtitles(subs){
    Subtitles.custom(subs)
}

/**
 * Запустить другой плеер
 * @doc
 * @name runas
 * @alias Player
 * @param {string} need android, ios, webos, apple, apple_tv, macos, desktop, other
 */

function runas(need){
    launch_player = need
}

/**
 * Обратный вызов при закрытии плеера
 * @doc
 * @name callback
 * @alias Player
 * @param {function} back 
 */

function onBack(back){
    callback = back
}

/**
 * Рендер плеера
 * @doc
 * @name render
 * @alias Player
 * @returns Html
 */
function render(){
    return html
}

/**
 * Возвращает статус, открыт ли плеер
 * @doc
 * @name opened
 * @alias Player
 * @returns {boolean}
 */

function opened(){
    return is_opened
}

/**
 * Показать процесс загрузки
 * @doc
 * @name loading
 * @alias Player
 * @param {boolean} status cтатус загрузки, `true` - показать, `false` - скрыть
 */

function loading(status){
    if(!work) return

    wait_loading = status

    html.toggleClass('player--loading',Boolean(status))

    if(wait_loading){
        Controller.toggle('player-loading')

        Video.pause()
    }
    else{
        Video.play()

        toggle()
    }
}

/**
 * Уничтожить плеер
 */
function destroy(){
    Timeline.destroy()

    if(work.viewed) work.viewed(viewing.time)

    work = false

    wait_for_loading_url = false
    wait_loading = false

    viewing.time       = 0
    viewing.difference = 0
    viewing.current    = 0

    html.removeClass('player--ios')
    html.removeClass('iptv')
    html.removeClass('iptv--player')
    html.removeClass('player--panel-visible')
    html.removeClass('player--loading')

    Video.destroy()

    Video.clearParamas()

    html.detach()

    is_opened = false

    Background.theme('reset')

    $('body').removeClass('player--viewing')

    if(Select.opened()) Select.hide()

    listener.send('destroy',{})
}

export default {
    init,
    listener,
    toggle,
    play,
    playlist,
    render,
    subtitles,
    runas,
    callback: onBack,
    opened,
    iptv,
    programReady: TV.programReady,
    close: backward,
    getUrlQuality,
    loading,
    timecodeRecording: Timeline.setRecording,
    playdata: ()=>work
}
