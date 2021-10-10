import Video from './player/video'
import Panel from './player/panel'
import Info from './player/info'
import Controller from './controller'
import Template from './template'
import Utils from '../utils/math'
import Playlist from './player/playlist'
import Storage from '../utils/storage'
import Platform from '../utils/platform'
import Timeline from './timeline'


let html = Template.get('player')
    html.append(Video.render())
    html.append(Panel.render())
    html.append(Info.render())

let callback
let work = false

/**
 * Подписываемся на события
 */
Video.listener.follow('timeupdate',(e)=>{
    Panel.update('time',Utils.secondsToTime(e.current | 0,true))
    Panel.update('timenow',Utils.secondsToTime(e.current || 0))
    Panel.update('timeend',Utils.secondsToTime(e.duration || 0))
    Panel.update('position', (e.current / e.duration * 100) + '%')

    if(work && work.timeline && e.duration){
        if(!work.timeline.continued){
            let prend = e.duration - 15,
                posit = Math.round(e.duration * work.timeline.percent / 100)

            if(posit > 10) Video.to(posit > prend ? prend : posit)

            work.timeline.continued = true
        }
        else{
            work.timeline.percent = Math.round(e.current / e.duration * 100)
        }
    }
})

Video.listener.follow('progress',(e)=>{
    Panel.update('peding',e.down)
})

Video.listener.follow('canplay',(e)=>{
    Panel.canplay()
})

Video.listener.follow('play',(e)=>{
    Panel.update('play')
})

Video.listener.follow('pause',(e)=>{
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

Video.listener.follow('videosize', (e)=>{
    Info.set('size', e)
})

Video.listener.follow('error', (e)=>{
    Info.set('error', e.error)
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

Playlist.listener.follow('select',(e)=>{
    destroy()

    play(e.item)

    Info.set('stat',e.item.url)
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
        back: ()=>{
            destroy()

            if(callback) callback()
            else Controller.toggle('content')

            callback = false
        }
    })

    Controller.toggle('player')
}

/**
 * Уничтожить
 */
function destroy(){
    if(work.timeline) Timeline.update(work.timeline)

    work = false

    Video.destroy()

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
                        "lastPlayPosition":-1
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

function runAndroid(url){
    $('<a href="'+url+'"><a/>')[0].click()
}

/**
 * Запустит плеер
 * @param {Object} data 
 */
function play(data){
    if(Platform.is('webos') && Storage.field('player') == 'webos'){
        runWebOS({
            need: 'com.webos.app.photovideo',
            url: data.url,
            name: data.path || data.title
        })
    } 
    else if(Platform.is('android') && Storage.field('player') == 'android'){
        runAndroid(data.url)
    }
    else{
        work = data

        Playlist.url(data.url)

        Video.url(data.url)

        Video.size(Storage.get('player_size','default'))

        Info.set('name',data.title)
        
        $('body').append(html)

        toggle()

        Panel.show(true)
    }
}

/**
 * Статистика
 * @param {String} url 
 */
function stat(url){
    if(work) Info.set('stat',url)
}

/**
 * Установить плейлист
 * @param {Array} playlist 
 */
function playlist(playlist){
    if(work) Playlist.set(playlist)
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

export default {
    play,
    playlist,
    render,
    stat,
    callback: onBack
}