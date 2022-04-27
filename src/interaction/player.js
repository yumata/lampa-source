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
import Modal from './modal'

let html = Template.get('player')
    html.append(Video.render())
    html.append(Panel.render())
    html.append(Info.render())

let callback
let work    = false
let network = new Reguest()
let launch_player

let preloader = {
    wait: false
}

let viewing = {
    time: 0,
    difference: 0,
    current: 0
}

html.on('mousemove',()=>{
    if(Storage.field('navigation_type') == 'mouse') Panel.mousemove()
})

/**
 * Подписываемся на события
 */
Video.listener.follow('timeupdate',(e)=>{
    Panel.update('time',Utils.secondsToTime(e.current | 0,true))
    Panel.update('timenow',Utils.secondsToTime(e.current || 0))
    Panel.update('timeend',Utils.secondsToTime(e.duration || 0))
    Panel.update('position', (e.current / e.duration * 100) + '%')

    if(work && work.timeline && !work.timeline.waiting_for_user && e.duration){
        if(Storage.field('player_timecode') !== 'again' && !work.timeline.continued){
            let prend = e.duration - 15,
                posit = Math.round(e.duration * work.timeline.percent / 100)

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

Video.listener.follow('progress',(e)=>{
    Panel.update('peding',e.down)
})

Video.listener.follow('canplay',(e)=>{
    Panel.canplay()
})

Video.listener.follow('play',(e)=>{
    Screensaver.disable()

    Panel.update('play')
})

Video.listener.follow('pause',(e)=>{
    Screensaver.enable()

    Panel.update('pause')
})

Video.listener.follow('rewind', (e)=>{
    Panel.rewind()
})

Video.listener.follow('ended', (e)=>{
    if(Storage.field('playlist_next')) Playlist.next()
})

Video.listener.follow('tracks', (e)=>{
    Panel.setTracks(e.tracks)
})

Video.listener.follow('subs', (e)=>{
    Panel.setSubs(e.subs)
})

Video.listener.follow('levels', (e)=>{
    Panel.setLevels(e.levels, e.current)
})

Video.listener.follow('videosize', (e)=>{
    Info.set('size', e)
})

Video.listener.follow('error', (e)=>{
    Info.set('error', e.error)
})

Video.listener.follow('reset_continue', (e)=>{
    if(work && work.timeline) work.timeline.continued = false
})

Panel.listener.follow('mouse_rewind',(e)=>{
    let vid = Video.video()

    if(vid && vid.duration){
        e.time.removeClass('hide').text(Utils.secondsToTime(vid.duration * e.percent)).css('left',(e.percent * 100)+'%')

        if(e.method == 'click'){
            Video.to(vid.duration * e.percent)
        }
    }
})

Panel.listener.follow('playpause',(e)=>{
    Video.playpause()
})

Panel.listener.follow('playlist',(e)=>{
    Playlist.show()
})

Panel.listener.follow('size',(e)=>{
    Video.size(e.size)

    Storage.set('player_size',e.size)
})

Panel.listener.follow('prev',(e)=>{
    Playlist.prev()
})

Panel.listener.follow('next',(e)=>{
    Playlist.next()
})

Panel.listener.follow('rprev',(e)=>{
    Video.rewind(false)
})

Panel.listener.follow('rnext',(e)=>{
    Video.rewind(true)
})

Panel.listener.follow('subsview',(e)=>{
    Video.subsview(e.status)
})

Panel.listener.follow('visible',(e)=>{
    Info.toggle(e.status)
})

Panel.listener.follow('to_start',(e)=>{
    Video.to(0)
})

Panel.listener.follow('to_end',(e)=>{
    Video.to(-1)
})

Panel.listener.follow('fullscreen',()=>{
    let doc  = window.document
    let elem = doc.documentElement

    let requestFullScreen = elem.requestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullScreen || elem.msRequestFullscreen
    let cancelFullScreen  = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(elem)
    }
    else {
        cancelFullScreen.call(doc)
    }
})

Panel.listener.follow('quality',(e)=>{
    Video.destroy(true)

    Video.url(e.url)

    if(work && work.timeline) work.timeline.continued = false
})

Playlist.listener.follow('select',(e)=>{
    let params = Video.saveParams()

    destroy()

    play(e.item)

    Video.setParams(params)

    if(e.item.url.indexOf(Torserver.ip()) > -1) Info.set('stat',e.item.url)

    Panel.showNextEpisodeName({playlist: e.playlist, position: e.position})
})

Playlist.listener.follow('set',Panel.showNextEpisodeName)

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
            Video.rewind(true)
        },
        left: ()=>{
            Video.rewind(false)
        },
        gone: ()=>{

        },
        enter: ()=>{
            Video.playpause()
        },
        playpause: () => {
            Video.playpause()
        },
        play: () => {
            Video.play()
        },
        pause: () => {
            Video.pause()
        },
        rewindForward: () => {
            Video.rewind(true)
        },
        rewindBack: () => {
            Video.rewind(false)
        },
        back: backward
    })

    Controller.toggle('player')
}

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

function backward(){
    destroy()

    if(callback) callback()
    else Controller.toggle('content')

    callback = false
}

/**
 * Уничтожить
 */
function destroy(){
    if(work.timeline) work.timeline.handler(work.timeline.percent, work.timeline.time, work.timeline.duration)

    if(work.viewed) work.viewed(viewing.time)

    work = false

    preloader.wait = false
    preloader.call = null

    viewing.time       = 0
    viewing.difference = 0
    viewing.current    = 0

    Screensaver.enable()

    Video.destroy()

    Video.clearParamas()

    Panel.destroy()

    Info.destroy()

    html.detach()
}

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
            console.log("The app is launched");
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


function preload(data, call){
    if(data.url.indexOf(Torserver.ip()) > -1 && data.url.indexOf('&preload') > -1){
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

            Modal.open({
                title: '',
                html: $('<div style="text-align: center"><div class="selector about">Продолжить просмотр с '+Utils.secondsToTime(work.timeline.time)+'?</div></div>'),
                overlay: true,
                onSelect: ()=>{
                    Modal.close()

                    work.timeline.waiting_for_user = false

                    toggle()
                },
                onBack: ()=>{
                    work.timeline.continued = true

                    Modal.close()
                    
                    toggle()
                }
            })
        }
    }
}

/**
 * Запустит плеер
 * @param {Object} data 
 */
function play(data){
    console.log('Player','url:',data.url)

    let lauch = ()=>{
        preload(data, ()=>{
            work = data
            
            if(work.timeline) work.timeline.continued = false

            Playlist.url(data.url)

            Panel.quality(data.quality,data.url)

            Video.url(data.url)

            Video.size(Storage.get('player_size','default'))

            if(data.subtitles) Video.customSubs(data.subtitles)

            Info.set('name',data.title)
            
            if(!preloader.call) $('body').append(html)

            toggle()

            Panel.show(true)

            Controller.updateSelects()

            ask()
        })
    }

    if(launch_player == 'lampa') lauch()
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

        Android.openPlayer(data.url, data)
    }
    else lauch()

    launch_player = ''
}

/**
 * Статистика
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

function render(){
    return html
}

function opened(){
    return $('body').find('.player').length ? true : false
}

export default {
    play,
    playlist,
    render,
    stat,
    subtitles,
    runas,
    callback: onBack,
    opened
}
