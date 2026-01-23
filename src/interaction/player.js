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
import Noty from '../interaction/noty'
import Lang from '../core/lang'
import Arrays from '../utils/arrays'
import Background from './background'
import TV from './player/iptv' 
import ParentalControl from './parental_control'
import Preroll from './advert/preroll'
import Footer from './player/footer'
import Segments from './player/segments'

let html
let listener = Subscribe()

let callback
let work = false
let launch_player
let timer_ask
let timer_save
let wait_for_loading_url = false
let wait_loading = false
let is_opened = false

let preloader = {
    wait: false
}

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

    html = Template.get('player')
    html.append(Video.render())
    html.append(Panel.render())
    html.append(Info.render())
    html.append(Footer.render())

    let timer_hide_cursor

    html.on('mousemove',()=>{
        if(Storage.field('navigation_type') == 'mouse' && !Utils.isTouchDevice()) Panel.mousemove()

        html.css('cursor','auto')

        clearTimeout(timer_hide_cursor)

        timer_hide_cursor = setTimeout(()=>{
            html.css('cursor','none')
        },3000)
    })

    if(!window.localStorage.getItem('player_torrent')) Storage.set('player_torrent', Storage.field('player'))

    /** Следим за обновлением времени */
    Video.listener.follow('timeupdate',(e)=>{
        Panel.update('time',Utils.secondsToTime(e.current | 0,true))
        Panel.update('timenow',Utils.secondsToTime(e.current || 0))
        Panel.update('timeend',Utils.secondsToTime(e.duration || 0))
        Panel.update('position', (e.current / e.duration * 100) + '%')

        Screensaver.resetTimer()

        if(work && work.timeline && !work.timeline.waiting_for_user && !work.timeline.stop_recording && e.duration){
            if(Storage.field('player_timecode') !== 'again' && !work.timeline.continued){
                let exact = parseFloat(work.timeline.time + '')
                    exact = isNaN(exact) ? 0 : parseFloat(exact.toFixed(3))

                let prend = e.duration - 15,
                    posit = exact > 0 && exact < e.duration ? exact : Math.round(e.duration * work.timeline.percent / 100)

                if(posit > 10 && work.timeline.percent < 90) Video.to(posit > prend ? prend : posit)

                work.timeline.continued = true
            }
            else{
                work.timeline.percent  = Math.round(e.current / e.duration * 100)
                work.timeline.time     = e.current
                work.timeline.duration = e.duration
            }
        }

        viewing.difference = e.current - viewing.current

        viewing.current = e.current

        if(viewing.difference > 0 && viewing.difference < 3) viewing.time += viewing.difference
    })

    /** Буферизация видео */
    Video.listener.follow('progress',(e)=>{
        Panel.update('peding',e.down)
    })

    /** Может ли плеер начать играть */
    Video.listener.follow('canplay',(e)=>{
        Panel.canplay()
    })

    /** Плей видео */
    Video.listener.follow('play',(e)=>{
        Panel.update('play')

        Panel.rewind()
    })

    /** Пауза видео */
    Video.listener.follow('pause',(e)=>{
        Panel.update('pause')
    })

    /** Перемотка видео */
    Video.listener.follow('rewind', (e)=>{
        Panel.rewind()
    })

    /** Видео было завершено */
    Video.listener.follow('ended', (e)=>{
        if(Storage.field('playlist_next') && !$('body').hasClass('selectbox--open')) Playlist.next()
    })

    /** Дорожки полученые из видео */
    Video.listener.follow('tracks', (e)=>{
        if(!work.voiceovers) Panel.setTracks(e.tracks)
    })

    /** Субтитры полученые из видео */
    Video.listener.follow('subs', (e)=>{
        Panel.setSubs(e.subs)
    })

    /** Качество видео в m3u8 */
    Video.listener.follow('levels', (e)=>{
        Panel.setLevels(e.levels, e.current)
    })

    /** Размер видео */
    Video.listener.follow('videosize', (e)=>{
        Info.set('size', e)
    })

    /** Ошибка при попытки возпроизвести */
    Video.listener.follow('error', (e)=>{
        if(work){
            Info.set('error', e.error)

            if(e.fatal && work.url_reserve){
                Video.destroy(true)

                Video.url(work.url_reserve, true)

                delete work.url_reserve
            }

            if(e.fatal && work.error) work.error(work, (reserve_url)=>{
                Video.destroy(true)

                Video.url(reserve_url, true)
            })
        }
    })

    Video.listener.follow('translate',(e)=>{
        Panel.updateTranslate(e.where, e.translate)
    })

    Video.listener.follow('loadeddata',()=>{
        if(Video.video().duration < 60*3 && work.need_check_live_stream){
            Panel.hideRewind()
        }
    })

    /** Сбросить (продолжить) */
    Video.listener.follow('reset_continue', (e)=>{
        if(work && work.timeline && !work.timeline.continued_bloc) work.timeline.continued = false
    })

    /** Перемотка мышкой */
    Panel.listener.follow('mouse_rewind',(e)=>{
        let vid = Video.video()

        if(vid && vid.duration){
            if(!Platform.screen('mobile')) e.time.removeClass('hide').text(Utils.secondsToTime(vid.duration * e.percent)).css('left',(e.percent * 100)+'%')

            if(e.method == 'click'){
                Video.to(vid.duration * e.percent)
            }
        }
    })

    /** Плей/Пауза */
    Panel.listener.follow('playpause',(e)=>{
        Video.playpause()

        if(Platform.screen('mobile')) Panel.rewind()
    })

    /** Нажали на плейлист */
    Panel.listener.follow('playlist',(e)=>{
        Playlist.show()
    })

    /** Изменить размер видео */
    Panel.listener.follow('size',(e)=>{
        Video.size(e.size)

        Storage.set('player_size',e.size)
    })

    /** Изменить скорость видео */
    Panel.listener.follow('speed',(e)=>{
        Video.speed(e.speed)

        Storage.set('player_speed',e.speed)
    })

    /** Предыдущая серия */
    Panel.listener.follow('prev',(e)=>{
        Playlist.prev()
    })

    /** Следуюшия серия */
    Panel.listener.follow('next',(e)=>{
        Playlist.next()
    })

    /** Перемотать назад */
    Panel.listener.follow('rprev',(e)=>{
        Video.rewind(false)
    })

    /** Перемотать далее */
    Panel.listener.follow('rnext',(e)=>{
        Video.rewind(true)
    })

    /** Показать/скрыть субтитры */
    Panel.listener.follow('subsview',(e)=>{
        Video.subsview(e.status)
    })

    /** Состояние панели, скрыта или нет */
    Panel.listener.follow('visible',(e)=>{
        Info.toggle(e.status)
        Video.normalizationVisible(e.status)
        html.toggleClass('player--panel-visible', e.status)
    })

    /** К началу видео */
    Panel.listener.follow('to_start',(e)=>{
        Video.to(0)
    })

    /** К концу видео */
    Panel.listener.follow('to_end',(e)=>{
        if(Playlist.canNext()){
            Video.pause()

            if(work && work.timeline){
                work.timeline.waiting_for_user = true
                work.timeline.percent  = 100
                work.timeline.time     = work.timeline.duration || 0
            }

            Playlist.next()
        }
        else{
            Video.to(-1)
        }
    })

    /** На весь экран */
    Panel.listener.follow('fullscreen',()=>{
        Utils.toggleFullscreen()
    })

    /** Картинка в картинке */
    Panel.listener.follow('pip',(e)=>{
        Video.togglePictureInPicture()
    })

    /** Переключили качеcтво видео */
    Panel.listener.follow('quality',(e)=>{
        Video.destroy(true)

        if(work){
            work.quality_switched = e.name
            work.url = e.url
        }

        Video.url(e.url, true)

        if(work && work.timeline){
            work.timeline.continued = false
            work.timeline.continued_bloc = false
        }
    })

    /** Переключили поток */
    Panel.listener.follow('flow',(e)=>{
        Video.destroy(true)

        Video.url(e.url, true)

        if(work && work.timeline){
            work.url = e.url

            if(work.timeline){
                work.timeline.continued = false
                work.timeline.continued_bloc = false
            }
        }
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

            destroy()

            e.item.continue_play = true

            Playlist.set(Playlist.get()) //надо повторно отправить, чтобы появилась кнопка плейлиста

            play(e.item)

            Video.setParams(params)

            if(e.item.callback) e.item.callback()

            if(Torserver.ip() && e.item.url.indexOf(Torserver.ip()) > -1) Info.set('stat',e.item.url)

            Playlist.active()

            Panel.showNextEpisodeName({playlist: Playlist.get(), position: Playlist.position()})
        }

        if(type == 'string') call()
        else if(type == 'function' && !wait_for_loading_url){
            Info.loading()

            wait_for_loading_url = true

            e.item.url(call)
        } 
    })

    /** Установить название следующей серии */
    Playlist.listener.follow('set',Panel.showNextEpisodeName)

    /** Прослушиваем на сколько загрузилось, затем запускаем видео */
    Info.listener.follow('stat',(e)=>{
        if(preloader.wait){
            let pb = e.data.preloaded_bytes || 0,
                ps = e.data.preload_size || 0
            
            let progress = Math.min(100,((pb * 100) / ps ))

            Panel.update('timenow',Math.round(progress) + '%')
            Panel.update('timeend',100 + '%')

            Panel.update('peding',progress + '%')

            if(progress >= 90 || isNaN(progress)){
                Panel.update('peding','0%')

                preloader.wait = false
                preloader.call()
            }
        }
    })

    TV.listener.follow('play',(data)=>{
        locked(data.channel, ()=>{
            Video.destroy()

            console.log('Player','url:',data.channel.url)

            Video.url(data.channel.url)

            Info.set('name', '')

            Controller.toggle('player_tv')
        })
    })
}

/**
 * Главный контроллер
 */
function toggle(){
    Controller.add('player',{
        invisible: true,
        toggle: ()=>{
            Panel.hide()
        },
        up: ()=>{
            Panel.toggle()
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
 * Вызвать событие назад
 */

/**
 * Закрыть плеер
 * @doc
 * @name close
 * @alias Player
 */

function backward(){
    destroy()

    if(callback) callback()
    else Controller.toggle('content')

    callback = false
}

/**
 * Уничтожить плеер
 */
function destroy(){
    saveTimeView()

    if(work.viewed) work.viewed(viewing.time)

    clearTimeout(timer_ask)
    clearInterval(timer_save)

    if(work.timeline) work.timeline.stop_recording = false

    work = false

    preloader.wait = false
    preloader.call = null

    wait_for_loading_url = false
    wait_loading = false

    viewing.time       = 0
    viewing.difference = 0
    viewing.current    = 0

    html.removeClass('player--ios')
    html.removeClass('iptv')
    html.removeClass('player--panel-visible')
    html.removeClass('player--loading')

    TV.destroy()

    Video.destroy()

    Video.clearParamas()

    Panel.destroy()

    Info.destroy()

    Footer.destroy()

    html.detach()

    is_opened = false

    Background.theme('reset')

    $('body').removeClass('player--viewing')

    if($('body').hasClass('selectbox--open')) Select.hide()

    listener.send('destroy',{})
}

/**
 * Запустить webos плеер
 * @param {Object} params 
 */
function runWebOS(params){
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

                runWebOS(params)
            }
            else if(params.need == 'com.webos.app.smartshare'){
                params.need = 'com.webos.app.mediadiscovery'

                runWebOS(params)
            }
        }
    });
}

/**
 * Показать предзагрузку торрента
 * @param {Object} data 
 * @param {Function} call 
 */
function preload(data, call){
    data.url = data.url.replace('&preload','&play')

    return call()
}

/**
 * Спросить продолжать ли просмотр
 */
function ask(){
    if(work && work.timeline && work.timeline.percent){
        work.timeline.waiting_for_user = false
        
        if(Storage.field('player_timecode') == 'ask'){
            work.timeline.waiting_for_user = true

            Select.show({
                title: Lang.translate('title_action'),
                items: [
                    {
                        title: Lang.translate('player_start_from') + ' ' + Utils.secondsToTime(work.timeline.time)+'?',
                        yes: true
                    },
                    {
                        title: Lang.translate('settings_param_no')
                    }
                ],
                onBack: ()=>{
                    work.timeline.continued = true
                    work.timeline.continued_bloc = true

                    toggle()

                    clearTimeout(timer_ask)
                },
                onSelect: (a)=>{
                    work.timeline.waiting_for_user = false

                    if(!a.yes){
                        work.timeline.continued = true
                        work.timeline.continued_bloc = true
                    } 

                    toggle()

                    clearTimeout(timer_ask)
                }
            })

            clearTimeout(timer_ask)

            timer_ask = setTimeout(()=>{
                work.timeline.continued = true
                work.timeline.continued_bloc = true

                Select.hide()
                
                toggle()
            },8000)
        }
    }
}

/**
 * Сохранить отметку просмотра
 */
function saveTimeView(){
    if(work.timeline && work.timeline.handler && !work.timeline.stop_recording) work.timeline.handler(work.timeline.percent, work.timeline.time, work.timeline.duration)
}

/**
 * Сохранять отметку просмотра каждые 2 минуты
 */
function saveTimeLoop(){
    if(work.timeline && !work.timeline.stop_recording){
        timer_save = setInterval(saveTimeView,1000*60*2)
    }
}

function locked(data, call){
    let name = Controller.enabled().name

    if(data.locked){
        ParentalControl.query(call, ()=>{
            Controller.toggle(name)
        })
    }
    else call()
}

function externalPlayer(player_need, data, players){
    let player   = Storage.field(player_need)
    let url      = encodeURIComponent(data.url.replace('&preload','&play'))
    let _url     = encodeURI(data.url.replace('&preload','&play'))
    let furl     = data.url.replace('&preload','&play')
    let playlist = data.playlist ? encodeURIComponent(JSON.stringify(data.playlist)) : ''

    for(let p in players){
        players[p] = players[p].replace('${url}', url).replace('${_url}', _url).replace('${furl}', furl).replace('${playlist}', playlist)
    }

    return players[player]
}

function start(data, need, inner){
    let player_need = 'player' + (need ? '_' + need : '')

    if(data.launch_player) launch_player = data.launch_player

    if(launch_player == 'lampa' || launch_player == 'inner' || Video.verifyTube(data.url)) inner()
    else if(Platform.is('apple')){
        let external_url = externalPlayer(player_need, data, {
            vlc:        'vlc://${furl}',
            nplayer:    'nplayer-${furl}',
            infuse:     'infuse://x-callback-url/play?url=${url}',
            senplayer:  'senplayer://x-callback-url/play?url=${url}',
            vidhub:     'open-vidhub://x-callback-url/open?&url=${url}',
            svplayer:   'svplayer://x-callback-url/stream?url=${url}',
            tracyplayer:'tracy://open?url=${url}'
        })

        if (external_url) {
            Preroll.show(data,()=>{
                listener.send('external',data)

                window.location.assign(external_url)
            })
        }
        else if(Storage.field(player_need) == 'ios'){
            html.addClass('player--ios')
            
            inner()
        }
        else inner()
    }
    else if(Platform.macOS()){
        let external_url = externalPlayer(player_need, data, {
            mpv:    'mpv://${_url}',
            iina:   'iina://weblink?url=${url}',
            nplayer:'nplayer-${_url}',
            infuse: 'infuse://x-callback-url/play?url=${url}'
        })

        if (external_url) {
            Preroll.show(data,()=>{
                listener.send('external',data)

                window.location.assign(external_url)
            })
        }
        else inner()
    }
    else if(Platform.is('apple_tv')){
        let apple_tv_client = Storage.field('apple_tv_client') ?? 'lampa';
        let external_url = externalPlayer(player_need, data, {
            vlc:        'vlc-x-callback://x-callback-url/stream?url=${url}',
            infuse:     `infuse://x-callback-url/play?x-success=${apple_tv_client}://infuseDidFinish&x-error=${apple_tv_client}://infuseDidFail&url=\${url}&playlist=\${playlist}`,
            senplayer:  'SenPlayer://x-callback-url/play?url=${url}',
            vidhub:     'open-vidhub://x-callback-url/open?url=${url}',
            svplayer:   'svplayer://x-callback-url/stream?url=${url}',
            tracyplayer:'tracy://open?url=${url}',
            tvos:       'lampa://video?player=tvos&src=${url}&playlist=${playlist}',
            tvosl:      'lampa://video?player=tvosav&src=${url}&playlist=${playlist}',
            tvosSelect: 'lampa://video?player=lists&src=${url}&playlist=${playlist}'
        })

        if (external_url) {
            Preroll.show(data,()=>{
                listener.send('external',data)

                window.location.assign(external_url)
            })
        }
        else inner()
    }
    else if(Platform.is('webos') && (Storage.field(player_need) == 'webos' || launch_player == 'webos')){
        Preroll.show(data,()=>{
            runWebOS({
                need: 'com.webos.app.photovideo',
                url: data.url.replace('&preload','&play'),
                name: data.path || data.title,
                position: data.timeline ? (data.timeline.time || -1) : -1
            })

            listener.send('external',data)
        })
    } 
    else if(Platform.is('android') && (Storage.field(player_need) == 'android' || launch_player == 'android' || data.torrent_hash)){
        data.url   = data.url.replace('&preload','&play')
        data.title = Utils.clearHtmlTags(data.title || '').trim()
        
        if(data.playlist && Array.isArray(data.playlist)){
            data.playlist = data.playlist.filter(p=>typeof p.url == 'string')

            data.playlist.forEach(a=>{
                a.url   = a.url.replace('&preload','&play')
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
        let path = Storage.field('player_nw_path')
        let file = require('fs')

        if (file.existsSync(path)) { 
            Preroll.show(data,()=>{
                let spawn = require('child_process').spawn

                spawn(path, [encodeURI(data.url.replace('&preload','&play'))])

                listener.send('external',data)
            })
        } 
        else{
            Noty.show(Lang.translate('player_not_found') + ': ' + path)
        }
    }
    else inner()
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

    console.log('Player','url:',data.url)

    if(data.quality){
        if(Arrays.getKeys(data.quality).length == 1) delete data.quality
        else{
            data.url = getUrlQuality(data.quality, false) || data.url
        }
    }

    let lauch = ()=>{
        work = data

        Preroll.show(data,()=>{
            Background.theme('black')

            $('body').addClass('player--viewing')

            preload(data, ()=>{
                html.toggleClass('tv',data.tv ? true : false)

                html.toggleClass('youtube', Boolean(data.url.indexOf('youtube.com') >= 0))

                listener.send('start',data)

                Storage.set('player_subs_shift_time', '0')

                if(work.timeline) work.timeline.continued = false

                Segments.set(data.segments)

                Playlist.url(data.url)

                Playlist.set(Playlist.get()) //надо повторно отправить, а то после рекламы неправильно показывает

                Panel.quality(data.quality,data.url)

                if(data.translate) Panel.setTranslate(data.translate)

                Video.url(data.url)

                Video.size(Storage.get('player_size','default'))

                Video.speed(Storage.get('player_speed','default'))

                if(data.subtitles) Video.customSubs(data.subtitles)
                if(data.voiceovers) Panel.setTracks(data.voiceovers)

                Info.set('name',data.title)

                if(!data.iptv){
                    if(data.card) Footer.appendAbout(data.card)
                    else{
                        Lampa.Activity.active().movie && Footer.appendAbout(Lampa.Activity.active().movie)
                    }
                }
                
                if(!preloader.call) {
                    is_opened = true

                    $('body').append(html)
                }

                toggle()

                Panel.show(true)

                ask()

                saveTimeLoop()

                listener.send('ready',data)
            })
        })
    }

    start(data, data.torrent_hash ? 'torrent' : '', lauch)

    launch_player = ''
}

function iptv(data){
    locked(data, ()=>{
        console.log('Player','play iptv')

        data.iptv = true //пометка для ведра, что это iptv

        let lauch = ()=>{
            Background.theme('black')

            listener.send('start',data)

            html.toggleClass('iptv',true)

            TV.start(data)

            Video.size(Storage.get('player_size','default'))

            Video.speed(Storage.get('player_speed','default'))

            $('body').append(html)

            is_opened = true

            toggle()

            Panel.show(true)

            listener.send('ready',data)
        }

        let ads = ()=>{
            if(data.vast_url) Preroll.show(data,lauch)
            else lauch()
        }

        start(data, 'iptv', ads)
    })
}

/**
 * Статистика для торрсервера
 * @param {String} url 
 */
function stat(url){
    if(work || preloader.wait) Info.set('stat',url)
}

/**
 * Установить плейлист
 * @doc
 * @name playlist
 * @alias Player
 * @param {array} data JSON([{"title":"{string} - Серия 1", "url":"{string} - http://example/video.mp4"}])
 */

function playlist(playlist){
    if(work || preloader.wait) Playlist.set(playlist)
}

/**
 * Установить субтитры для видео
 * @doc
 * @name subtitles
 * @alias Player
 * @param {array} subs JSON([{"index":"{integer}", "label":"{string}", "url":"http://example/subs.srt"}])
 */

function subtitles(subs){
    if(work || preloader.wait){
        Video.customSubs(subs)
    } 
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

function timecodeRecording(status){
    if(work && work.timeline){
        work.timeline.stop_recording = !status
    }
}

export default {
    init,
    listener,
    play,
    playlist,
    render,
    stat,
    subtitles,
    runas,
    callback: onBack,
    opened,
    iptv,
    programReady: TV.programReady,
    close: backward,
    getUrlQuality,
    loading,
    timecodeRecording,
    playdata: ()=>work
}