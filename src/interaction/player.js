import Video from './player/video'
import Panel from './player/panel'
import Info from './player/info'
import Controller from './controller'
import Template from './template'
import Utils from '../utils/math'
import Playlist from './player/playlist'
import Storage from '../utils/storage'
import Platform from '../utils/platform'
import Screensaver from './screensaver'
import Torserver from './torserver'
import Reguest from '../utils/reguest'
import Android from '../utils/android'
import Broadcast from './broadcast'
import Select from './select'
import Subscribe from '../utils/subscribe'
import Noty from '../interaction/noty'
import Lang from '../utils/lang'
import Arrays from '../utils/arrays'
import Background from './background'
import TV from './player/iptv' 

let html
let listener = Subscribe()
let network  = new Reguest()

let callback
let work = false
let launch_player
let timer_ask
let timer_save
let wait_for_loading_url = false

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

    html = Template.get('player')
    html.append(Video.render())
    html.append(Panel.render())
    html.append(Info.render())

    html.on('mousemove',()=>{
        if(Storage.field('navigation_type') == 'mouse' && !Utils.isTouchDevice()) Panel.mousemove()
    })

    /** Следим за обновлением времени */
    Video.listener.follow('timeupdate',(e)=>{
        Panel.update('time',Utils.secondsToTime(e.current | 0,true))
        Panel.update('timenow',Utils.secondsToTime(e.current || 0))
        Panel.update('timeend',Utils.secondsToTime(e.duration || 0))
        Panel.update('position', (e.current / e.duration * 100) + '%')

        Screensaver.resetTimer()

        if(work && work.timeline && !work.timeline.waiting_for_user && e.duration){
            if(Storage.field('player_timecode') !== 'again' && !work.timeline.continued){
                let exact = parseFloat(work.timeline.time + '')
                    exact = isNaN(exact) ? 0 : parseFloat(exact.toFixed(3))

                let prend = e.duration - 15,
                    posit = exact > 0 && exact < e.duration ? exact : Math.round(e.duration * work.timeline.percent / 100)

                if(posit > 10) Video.to(posit > prend ? prend : posit)

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
        //Screensaver.enable()

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
        Panel.setTracks(e.tracks)
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
        if(work) Info.set('error', e.error)
    })

    Video.listener.follow('translate',(e)=>{
        Panel.updateTranslate(e.where, e.translate)
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
    })

    /** К началу видео */
    Panel.listener.follow('to_start',(e)=>{
        Video.to(0)
    })

    /** К концу видео */
    Panel.listener.follow('to_end',(e)=>{
        Video.to(-1)
    })

    /** На весь экран */
    Panel.listener.follow('fullscreen',()=>{
        Utils.toggleFullscreen()
    })

    /** Картинка в картинке */
    Panel.listener.follow('pip',(e)=>{
        Video.togglePictureInPicture()
    })

    /** Переключили качемтво видео */
    Panel.listener.follow('quality',(e)=>{
        Video.destroy(true)

        Video.url(e.url, true)

        if(work && work.timeline){
            work.timeline.continued = false
            work.timeline.continued_bloc = false
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
        Video.destroy()

        console.log('Player','url:',data.channel.url)

        Video.url(data.channel.url)

        Info.set('name', '')
    })
}

/**
 * Главный контроллер
 */
function toggle(){
    Controller.add('player',{
        invisible: true,
        toggle: ()=>{
            if(!Platform.screen('mobile')) Panel.hide()
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
        gone: ()=>{

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
        back: backward
    })

    Controller.toggle('player')
}

/**
 * Контроллер предзагрузки
 */
function togglePreload(){
    Controller.add('player_preload',{
        invisible: true,
        toggle: ()=>{
            
        },
        enter: ()=>{
            Panel.update('peding','0%')

            preloader.wait = false
            preloader.call()
        },
        back: backward
    })

    Controller.toggle('player_preload')
}

/**
 * Вызвать событие назад
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

    work = false

    preloader.wait = false
    preloader.call = null

    wait_for_loading_url = false

    viewing.time       = 0
    viewing.difference = 0
    viewing.current    = 0

    html.removeClass('player--ios')
    html.removeClass('iptv')

    TV.destroy()

    Video.destroy()

    Video.clearParamas()

    Panel.destroy()

    Info.destroy()

    html.detach()

    Background.theme('reset')

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
    if(Torserver.ip() && data.url.indexOf(Torserver.ip()) > -1 && data.url.indexOf('&preload') > -1){
        preloader.wait = true

        Info.set('name',data.title)

        $('body').append(html)

        Panel.show(true)

        togglePreload()

        network.timeout(2000)

        network.silent(data.url)

        preloader.call = ()=>{
            data.url = data.url.replace('&preload','&play')

            call()
        }
    }
    else call()
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
    if(work.timeline && work.timeline.handler) work.timeline.handler(work.timeline.percent, work.timeline.time, work.timeline.duration)
}

/**
 * Сохранять отметку просмотра каждые 2 минуты
 */
function saveTimeLoop(){
    if(work.timeline){
        timer_save = setInterval(saveTimeView,1000*60*2)
    }
}

/**
 * Запустить плеер
 * @param {Object} data 
 */
function play(data){
    console.log('Player','url:',data.url)

    if(data.quality){
        if(Arrays.getKeys(data.quality).length == 1) delete data.quality
        else{
            for(let q in data.quality){
                if(parseInt(q) == Storage.field('video_quality_default')){
                    data.url = data.quality[q]
    
                    break
                }
            }
        }
    }

    let lauch = ()=>{
        Background.theme('black')

        preload(data, ()=>{
            html.toggleClass('tv',data.tv ? true : false)

            html.toggleClass('youtube', Boolean(data.url.indexOf('youtube.com') >= 0))

            listener.send('start',data)

            work = data
            
            if(work.timeline) work.timeline.continued = false

            Playlist.url(data.url)

            Panel.quality(data.quality,data.url)

            if(data.translate) Panel.setTranslate(data.translate)

            Video.url(data.url)

            Video.size(Storage.get('player_size','default'))

            Video.speed(Storage.get('player_speed','default'))

            if(data.subtitles) Video.customSubs(data.subtitles)

            Info.set('name',data.title)
            
            if(!preloader.call) $('body').append(html)

            toggle()

            Panel.show(true)

            ask()

            saveTimeLoop()

            listener.send('ready',data)
        })
    }

    if(launch_player == 'lampa' || data.url.indexOf('youtube.com') >= 0) lauch()
    else if(Platform.is('apple')){
        data.url = data.url.replace('&preload','&play').replace(/\s/g,'%20')

        if(Storage.field('player') == 'vlc') return window.open('vlc://' + data.url)
        else{
            if(Storage.field('player') == 'ios') html.addClass('player--ios')

            lauch()
        }
    }
    else if(Platform.is('webos') && (Storage.field('player') == 'webos' || launch_player == 'webos')){
        data.url = data.url.replace('&preload','&play')

        runWebOS({
            need: 'com.webos.app.photovideo',
            url: data.url,
            name: data.path || data.title,
            position: data.timeline ? (data.timeline.time || -1) : -1
        })
    } 
    else if(Platform.is('android') && (Storage.field('player') == 'android' || launch_player == 'android')){
        data.url = data.url.replace('&preload','&play')

        if(data.playlist && Array.isArray(data.playlist)){
            data.playlist = data.playlist.filter(p=>typeof p.url == 'string')

            data.playlist.forEach(a=>{
                a.url = a.url.replace('&preload','&play')
            })
        }

        Android.openPlayer(data.url, data)
    }
    else if(Platform.desktop() && Storage.field('player') == 'other'){
        let path = Storage.field('player_nw_path')
        let file = require('fs')

        data.url = data.url.replace('&preload','&play').replace(/\s/g,'%20')

        if (file.existsSync(path)) { 
            let spawn = require('child_process').spawn

			spawn(path, [data.url])
        } 
        else{
            Noty.show(Lang.translate('player_not_found') + ': ' + path)
        }
    }
    else lauch()

    launch_player = ''
}

function iptv(object){
    console.log('Player','play iptv')

    listener.send('start',object)

    html.toggleClass('iptv',true)

    TV.start(object)

    Video.size(Storage.get('player_size','default'))

    Video.speed(Storage.get('player_speed','default'))

    $('body').append(html)

    toggle()

    Panel.show(true)

    listener.send('ready',object)
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
 * @param {Array} playlist 
 */
function playlist(playlist){
    if(work || preloader.wait) Playlist.set(playlist)
}

/**
 * Установить субтитры
 * @param {Array} subs 
 */
function subtitles(subs){
    if(work || preloader.wait){
        Video.customSubs(subs)
    } 
}

/**
 * Запустить другой плеер
 * @param {String} need - тип плеера
 */
function runas(need){
    launch_player = need
}

/**
 * Обратный вызов
 * @param {Function} back 
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
 * @returns boolean
 */
function opened(){
    return $('body').find('.player').length ? true : false
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
    programReady: TV.programReady
}
