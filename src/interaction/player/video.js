import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Tizen from './video/tizen'
import WebOSManager from './video/webos'
import Tube from './video/tube'
import HlsStream from './video/hls'
import DashStream from './video/dash'
import Platform from '../../core/platform'
import Arrays from '../../utils/arrays'
import Storage from '../../core/storage/storage'
import Normalization from './video/normalization'
import Lang from '../../core/lang'
import Panel from './panel'
import Utils from '../../utils/utils'
import DeviceInput from '../device_input'
import Orsay from './video/orsay'
import YouTube from './youtube'
import TV from './iptv'
import Controller from '../../core/controller'
import Player from '../player'
import Segments from './segments'
import Bell from '../bell'

let listener = Subscribe()
let html
let display
let paused
let backworkIcon
let forwardIcon

let timer           = {}
let params          = {}
let rewind_position = 0
let rewind_force    = 0

let video
let wait
let need_scale
let need_scale_last
let need_speed
let normalization

let hls_subs_cues         = {}
let hls_subs_active_track = -1

let click_nums = 0
let click_timer
let pause_timer


function init(){
    html      = Template.get('player_video')
    display   = html.find('.player-video__display')
    paused    = html.find('.player-video__paused')

    backworkIcon = html.find('.player-video__backwork-icon')
    forwardIcon  = html.find('.player-video__forward-icon')

    html.find('.player-video__backwork-icon,.player-video__forward-icon').on('animationend', function () {
        $(this).removeClass('rewind')
    })

    html.on('click',(e)=>{
        if(DeviceInput.canClick(e.originalEvent)){
            clearTimeout(click_timer)
            
            click_nums++

            if(TV.playning()) click_nums = 1

            if (click_nums === 1) {
                click_timer = setTimeout(() => {
                    click_nums = 0

                    if(Panel.visibleStatus() && !TV.playning()) playpause()
                    else Panel.mousemove()
                }, 300)
            }
            else if (click_nums > 1) {
                click_timer = setTimeout(() => {
                    let third = window.innerWidth / 3;
                    let pow = (click_nums - 1) * 10

                    let dir;

                    if (e.clientX > third * 2) {
                        dir = 1;
                    } else if (e.clientX < third) {
                        dir = -1;
                    }

                    if(dir == 1){
                        forwardIcon.addClass('rewind').find('span').text('+' + pow + ' sec')
                        to(video.currentTime + dir * pow)
                    }
                    else if (dir == -1){
                        backworkIcon.addClass('rewind').find('span').text('-' + pow + ' sec')
                        to(video.currentTime + dir * pow)
                    } 
                    else if(Utils.canFullScreen()){
                        Utils.toggleFullscreen()
                    }

                    click_nums = 0
                }, 300)
            }
        } 
    })

    Lampa.Listener.follow('resize_end', ()=>{
        if(video){
            need_scale = need_scale_last

            scale()

            if(video.resize) video.resize()
        } 
    })

    Tube.register({
        name: 'YouTube',
        verify: (src) => src.indexOf('youtube.com') >= 0 || src.indexOf('youtu.be') >= 0,
        create: YouTube
    })

    Segments.listener.follow('skip', (e) => {
        if(Storage.get('player_segments_' + e.type, 'auto') == 'auto'){
            video.currentTime = Math.min(video.duration, e.segment.end)

            Bell.push({text: Lang.translate('player_segments_skiped'), icon: Template.string('icon_viewed')})
        }
    })

    Panel.listener.follow('visible',(e)=>{
        if(normalization) normalization.visible(e.status)
    })
}


/**
 * Добовляем события к контейнеру
 */
function bind(){
    // ждем загрузки
    video.addEventListener("waiting", function (){
        loader(true)
    })

    // начали играть
    video.addEventListener("playing", function (){
        loader(false)
    })

    // видео закончилось
    video.addEventListener('ended', function() {
        listener.send('ended', {})
    })

    if(Platform.is('apple') && Storage.field('player') == 'ios'){
        video.addEventListener('webkitendfullscreen', (e) => { Controller.back() })
    }

    // что-то пошло не так
    video.addEventListener('error', function(e){
        let error = video.error || {}
        let msg   = (error.message || '').toUpperCase();

        if(msg.indexOf('EMPTY SRC') == -1){
            if(error.code == 3){
                listener.send('error', {error: Lang.translate('player_error_one'), fatal: true})
            }
            else if(error.code == 4){
                listener.send('error', {error: Lang.translate('player_error_two'), fatal: true})
            }
            else if(typeof error.code !== 'undefined'){
                listener.send('error', {error: 'code ['+error.code+'] details ['+msg+']', fatal: true})
            }
        } 
    })

    // прогресс буферизации
    video.addEventListener('progress', function(e) {
        if(typeof e.percent !== 'undefined'){
            listener.send('progress', {down: e.percent + '%'})
        }
        else{
            let duration =  video.duration
            let seconds  = 0

            if (duration > 0) {
                try{
                    for (let i = 0; i < video.buffered.length; i++) {
                        if (video.buffered.start && video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
                            let down = Math.max(0,Math.min(100,(video.buffered.end(video.buffered.length - 1 - i) / duration) * 100)) + "%";

                            seconds = Math.max(0,video.buffered.end(video.buffered.length - 1 - i) - video.currentTime)

                            listener.send('progress', {down: down})

                            break
                        }
                    }
                }
                catch(e){}

                HlsStream.bitrate(seconds)
            }
        }
    })

    // можно ли уже проигрывать?
    video.addEventListener('canplay', function() {
        listener.send('canplay', {})
    })

    // сколько прошло
    video.addEventListener('timeupdate', function() {
        if(rewind_position == 0 && !video.rewind) listener.send('timeupdate', {duration: video.duration, current: video.currentTime})

        listener.send('videosize',{width: video.videoWidth, height: video.videoHeight})

        scale()

        HlsStream.update(video.currentTime)

        Segments.update(video.currentTime)

        hlsSubsTimeUpdate(video.currentTime)
    })

    //получены первые данные
    video.addEventListener('loadeddata', function (e) {
        Segments.adjust(video.duration)

        listener.send('videosize',{width: video.videoWidth, height: video.videoHeight})
        listener.send('loadeddata',{duration: video.duration, current: video.currentTime})

        scale()

        if(need_speed) speed(need_speed)

        loaded()
    })

    let pc = Boolean(Platform.desktop() || Platform.is('browser') || (Platform.is('apple') && !Utils.isPWA()))

    // для страховки
    video.volume = pc ? parseFloat(Storage.get('player_volume','1')) : 1
    video.muted  = false
}


/**
 * Конвертировать object to array, 
 * в некоторых случаях video возвращает object вместо array
 * @param {object[]} arr 
 * @returns {array}
 */
function convertToArray(arr){
    if(!Arrays.isArray(arr)){
        let new_arr = []

        for (let index = 0; index < arr.length; index++) {
            new_arr.push(arr[index])
        }

        arr = new_arr
    }

    return arr
}

/**
 * Масштаб видео
 */
function scale(){
    if(!need_scale) return

    var vw = video.videoWidth,
        vh = video.videoHeight,
        rt = 1,
        sx = 1.00,
        sy = 1.00

    if(vw == 0 || vh == 0 || typeof vw == 'undefined') return

    var increase = function(sfx,sfy){
        rt = Math.min(window.innerWidth / vw,  window.innerHeight / vh)

        sx = sfx
        sy = sfy
    }

    if(need_scale == 'default'){
        rt = Math.min(window.innerWidth / vw,  window.innerHeight / vh)
    }
    else if(need_scale == 'fill'){
        rt = Math.min(window.innerWidth / vw,  window.innerHeight / vh)

        sx = window.innerWidth / (vw * rt)
        sy = window.innerHeight / (vh * rt)
    }
    else if(need_scale == 's115'){
        increase(1.15, 1.15)
    }
    else if(need_scale == 's130'){
        increase(1.34, 1.34)
    }
    else if(need_scale == 'v115'){
        increase(1.01, 1.15)
    }
    else if(need_scale == 'v130'){
        increase(1.01, 1.34)
    }
    else{
        rt = Math.min(window.innerWidth / vw,  window.innerHeight / vh)

        vw = vw * rt
        vh = vh * rt

        rt = Math.max(window.innerWidth / vw,  window.innerHeight / vh)

        sx = rt
        sy = rt
    }

    sx = sx.toFixed(2)
    sy = sy.toFixed(2)
    
    // Для некоторых платформ, где видео не масштабируется, а растягивается
    if((Platform.is('orsay') && Storage.field('player') == 'inner') || Storage.field('player_scale_method') == 'calculate'){
        var nw = vw * rt,
            nh = vh * rt

        var sz = {
            width: Math.round(nw * sx) + 'px',
            height: Math.round(nh * sy) + 'px',
            marginLeft: Math.round(window.innerWidth / 2 - (nw*sx) / 2) + 'px',
            marginTop: Math.round(window.innerHeight / 2 - (nh*sy) / 2) + 'px'
        }
    }
    else{
        var sz = {
            width: Math.round(window.innerWidth) + 'px',
            height: Math.round(window.innerHeight) + 'px',
            transform: sx == 1.00 ? 'unset' : 'scaleX('+sx+') scaleY('+sy+')'
        }
    }
    
    $(video).css(sz)

    need_scale = false
}

/**
 * Сохранить текущие состояние дорожек и сабов
 * @returns {{sub:integer, track:integer, level:integer}}
 */
function saveParams(){
    let subs   = video.customSubs || video.webos_subs || video.textTracks || []
    let tracks = []

    let hlsTracks   = HlsStream.audioTracks()
    let dashTracks  = DashStream.audioTracks()
    let webosTracks = WebOSManager.audioTracks()

    if(hlsTracks)                                           tracks = hlsTracks
    else if(dashTracks)                                     tracks = dashTracks
    else if(video.audioTracks && video.audioTracks.length)  tracks = video.audioTracks

    if(webosTracks !== null) tracks = webosTracks

    if(tracks.length){
        for(let i = 0; i < tracks.length; i++){
            if(tracks[i].enabled == true || tracks[i].selected == true) params.track = i
        }
    }

    if(subs.length){
        for(let i = 0; i < subs.length; i++){
            if(subs[i].enabled == true || subs[i].selected == true){
                params.sub = subs[i].index
            } 
        }
    }

    let hlsLevel  = HlsStream.currentLevel()
    let dashLevel = DashStream.currentLevel()

    if(hlsLevel !== undefined)  params.level = hlsLevel
    if(dashLevel !== undefined) params.level = dashLevel

    console.log('Player','saved params', params)

    return params
}

/**
 * Очисить состояние
 */
function clearParamas(){
    params = {}
}

/**
 * Загрузитьновое состояние из прошлого
 * @param {{sub:integer, track:integer, level:integer}} saved_params 
 */
function setParams(saved_params){
    params = saved_params
}

/**
 * Смотрим есть ли дорожки и сабы
 */
function loaded(){
    let tracks = []
    let subs   = video.customSubs || video.textTracks || []

    console.log('Player','video full loaded')

    let hlsTracks  = HlsStream.setupAudioTracks()
    let dashTracks = DashStream.setupAudioTracks()

    if(hlsTracks)                                          tracks = hlsTracks
    else if(dashTracks)                                    tracks = dashTracks
    else if(video.audioTracks && video.audioTracks.length) tracks = video.audioTracks

    console.log('Player','tracks', video.audioTracks)

    if(WebOSManager.handleLoaded(params, subsview)) tracks = []

    if(tracks.length){
        tracks = convertToArray(tracks)

        if(typeof params.track !== 'undefined' && tracks[params.track]){
            tracks.forEach(e=>{e.selected = false})

            tracks[params.track].enabled = true
            tracks[params.track].selected = true

            console.log('Player','enable track by default')
        }

        listener.send('tracks', {tracks: tracks})
    }

    if(subs.length){
        subs = convertToArray(subs)
        
        if(typeof params.sub !== 'undefined' && subs[params.sub]){
            subs.forEach(e=>{e.mode = 'disabled'; e.selected = false})

            subs[params.sub].mode     = 'showing'
            subs[params.sub].selected = true

            subsview(true)
        }
        else if(Storage.field('subtitles_start')){
            let full = subs.find(s=>(s.label || '').indexOf('олные') >= 0)
             
            if(full){
                full.mode     = 'showing'
                full.selected = true
            }
            else{
                subs[0].mode     = 'showing'
                subs[0].selected = true
            }
            
            subsview(true)
        }

        listener.send('subs', {subs: subs})
    }

    let hlsLevels  = HlsStream.buildLevels(params.level)
    let dashLevels = DashStream.buildLevels(params.level)

    if(hlsLevels || dashLevels)  listener.send('levels', hlsLevels || dashLevels)
}


/**
 * Включить или выключить субтитры
 * @param {boolean} status 
 */
function subsview(status){
    html.find('.player-video__subtitles').toggleClass('hide', !Boolean(status))
}


/**
 * Создать контейнер для видео
 */
function create(){
    let videobox
    
    if(Platform.is('tizen') && Storage.field('player') == 'tizen'){
        videobox = Tizen((object)=>{
            video = object
        })
    }
    else if (Platform.is('orsay') && Storage.field('player') == 'orsay') {
        videobox = Orsay((object) => {
            video = object
        })
    }
    else{
        videobox = $('<video class="player-video__video" poster="./img/video_poster.png" crossorigin="anonymous"></video>')

        if(Platform.is('apple') && Storage.field('player') !== 'ios') videobox.attr('playsinline','true')

        video = videobox[0]

        if(typeof video.canPlayType !== 'function') video.canPlayType = ()=>{}

        if(Storage.field('player_normalization')){
            try{
                console.log('Player','normalization enabled')

                normalization = new Normalization()
                normalization.attach(video)
            }
            catch(e){
                console.log('Player','normalization error:', e.stack)
            }
        }
    }

    display.append(videobox)

    WebOSManager.setup()

    bind()
}

/**
 * Показать згразку или нет
 * @param {boolean} status 
 */
function loader(status){
    wait = status

    html.toggleClass('video--load', status)
}

/**
 * Устанавливаем ссылку на видео
 * @param {string} src - ссылка на видео
 * @param {boolean} change_quality - указывает что меняем качество, нужно для hlsjs, чтобы не создавать парсер заново
 */
 function url(src, change_quality){
    loader(true)

    let verify = Tube.verify(src)
  
    if(verify) {
        let videobox = verify.create((object) => {
            video = object
        })

        !!videobox && display.append(videobox)

        bind()

        setTimeout(()=>{
            load(src)
        },100)

        return
    }

    create()

    if(/\.mpd/.test(src) && typeof dashjs !== 'undefined'){
        DashStream.create(src, video, { load })
    }
    else if(/\.m3u8/.test(src)){
        if(navigator.userAgent.toLowerCase().indexOf('maple') > -1) src += '|COMPONENT=HLS'

        if(typeof Hls !== 'undefined'){
            let { use_program, hls_native } = HlsStream.shouldUseProgram(video, Player.playdata())

            console.log('Player','use program hls:', use_program, 'hlsjs support:', Hls.isSupported())

            if(!Platform.is('tizen')) console.log('Player', 'can play native hls:', hls_native ? true : false)

            if(use_program){
                HlsStream.createProgram(src, video, Player.playdata(), {
                    play,
                    load,
                    error: (msg, fatal) => listener.send('error', {error: msg, fatal}),
                    subtitles: (subs) => listener.send('subs', {subs})
                })
                hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, function(_event, data){
                    if(!data.subtitleTracks || !data.subtitleTracks.length) return

                    hls_subs_cues         = {}
                    hls_subs_active_track = -1

                    let subs = data.subtitleTracks.map(function(track, i){
                        let sub = {
                            index:    i,
                            label:    track.name || track.lang || ('Subtitle ' + (i + 1)),
                            selected: false
                        }

                        Object.defineProperty(sub, 'mode', {
                            set: function(v){
                                if(v == 'showing'){
                                    hls_subs_active_track = i
                                    hls.subtitleTrack     = i
                                    subsview(true)
                                }
                                else{
                                    if(hls_subs_active_track == i){
                                        hls_subs_active_track = -1
                                        hls.subtitleTrack     = -1
                                        applySubtitleToDom('')
                                    }
                                }
                            },
                            get: function(){ return hls_subs_active_track == i ? 'showing' : 'disabled' }
                        })

                        return sub
                    })

                    listener.send('subs', {subs: subs})
                })
                hls.on(Hls.Events.CUES_PARSED, function(_event, data){
                    let idx = hls.subtitleTrack
                    if(idx < 0) return

                    if(!hls_subs_cues[idx]) hls_subs_cues[idx] = []

                    data.cues.forEach(function(cue){ hls_subs_cues[idx].push(cue) })
                })
            }
            else if(!change_quality && !TV.playning()){
                HlsStream.createParser(src, Player.playdata(), {
                    load,
                    levels: (levels, current) => listener.send('levels', {levels, current}),
                    translate: (where, translate) => listener.send('translate', {where, translate})
                })
            }
            else load(src)
        }
        else load(src)
    }
    else load(src)
}

/**
 * Начать загрузку
 * @param {string} src 
 */
function load(src){
    HlsStream.destroyParser()

    DashStream.destroy()

    video.src = src

    console.log('Player','video load url:', src)

    video.load()

    play()
}

/**
 * Играем
 */
function play() {
    try {
        let promise = video.play()
        let call = () => {
            paused.addClass('hide')

            listener.send('play', {})

            console.log('Player', 'start playing');
        }

        if (promise && typeof promise.then === 'function') {
            promise.then(call).catch(e => {
                console.log('Player', 'play promise error:', e.message)
            })
        } else {
            // Старые браузеры
            call()
        }
    }
    catch (e) {
        console.log('Player', 'play error:', e.message);
    }
}

/**
 * Пауза
 */
function pause(){
    try {
        let promise = video.pause()
        let call = () => {
            paused.removeClass('hide')

            listener.send('pause', {})

            console.log('Player','pause')

            clearTimeout(pause_timer)

            pause_timer = setTimeout(()=>{
                paused.addClass('hide')
            },4000)
        }

        if (promise && typeof promise.then === 'function') {
            promise.then(call).catch(e => {
                console.log('Player', 'pause promise error:', e.message)
            })
        } else {
            // Старые браузеры
            call()
        }
    }
    catch (e) {
        console.log('Player', 'pause error:', e.message);
    }
}

/**
 * Играем или пауза
 */
function playpause(){
    if(wait || rewind_position) return

    if(video.paused) play()
    else             pause()
}

/**
 * Завершаем перемотку
 * @param {boolean} immediately - завершить немедленно
 */
function rewindEnd(immediately){
    clearTimeout(timer.rewind_call)

    timer.rewind_call = setTimeout(function(){
        video.currentTime = rewind_position

        rewind_position = 0
        rewind_force    = 0

        play()

        WebOSManager.rewinded()
    },immediately ? 0 : 1000)
}

/**
 * Подготовка к перемотке
 * @param {number} position_time - новое время
 * @param {boolean} immediately - завершить немедленно
 */
function rewindStart(position_time,immediately){
    if(!video.duration) return

    rewind_position = Math.max(0, Math.min(position_time, video.duration))

    pause()

    if(rewind_position == 0) video.currentTime = 0
    else if(rewind_position == video.duration) video.currentTime = video.duration

    timer.rewind = Date.now()

    listener.send('timeupdate', {duration: video.duration, current: rewind_position})
    listener.send('rewind',{})

    rewindEnd(immediately)
}

/**
 * Начать перематывать
 * @param {boolean} forward - направление, true - вперед
 * @param {number} custom_step - свое значение в секундах
 */
function rewind(forward, custom_step){
    if(video.duration){
        let step = Storage.field('player_rewind')

        if(rewind_position == 0){
            rewind_force = Math.max(5,custom_step || step)

            rewind_position = video.currentTime
        }

        rewind_force *= 1.03

        if(forward){
            rewind_position += rewind_force
        }
        else{
            rewind_position -= rewind_force
        }

        let skip = Segments.get(video.currentTime)

        if(forward && skip && !skip.segment.skiped && Storage.get('player_segments_' + skip.type) == 'user'){
            rewind_position = Math.min(video.duration, skip.segment.end)
            
            skip.segment.skiped = true
        }

        rewindStart(rewind_position)
    }
}

/**
 * Размер видео, масштаб
 * @param {string} type
 */
function size(type){
    need_scale = type
    need_scale_last = type

    scale()

    if(video.size) video.size(type)
}

function speed(value){
    need_speed = value

    let fv = value == 'default' ? 1 : parseFloat(value)

    if(video.speed) video.speed(fv)
    else if(WebOSManager.isActive()) WebOSManager.speed(fv)
    else video.playbackRate = fv
}

/**
 * Перемотка на позицию 
 * @param {number} type 
 */
function to(seconds){
    pause()

    try{
        if(seconds == -1) video.currentTime = Math.max(0,video.duration - 3)
        else video.currentTime              = Math.max(0, Math.min(seconds, video.duration))
    }
    catch(e){}

    play()
}

/**
 * Включить режим PIP
 */
function enterToPIP(){
    if (!document.pictureInPictureElement && document.pictureInPictureEnabled && video.requestPictureInPicture) {
        video.requestPictureInPicture()
    }
}

/**
 * Выключить режим PIP
 */
function exitFromPIP(){
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture()
    }
}

/**
 * Переключить режим PIP
 */
function pip(){
    if(document.pictureInPictureElement) exitFromPIP()
    else enterToPIP()
}

/**
 * Установить громкость
 * @param {number} vol 0-1
 */
function volume(vol){
    vol = Math.max(0, Math.min(vol, 1))

    video.volume = vol

    Storage.set('player_volume', vol)
}


/**
 * Уничтожить
 * @param {boolean} savemeta - сохранить с параметрами
 */
function destroy(savemeta){
    subsview(false)

    need_scale = false

    paused.addClass('hide')

    WebOSManager.destroy()

    clearTimeout(click_timer)

    let hls_destoyed  = HlsStream.destroy()
    let dash_destoyed = DashStream.destroy()

    exitFromPIP()

    if(video && !(hls_destoyed || dash_destoyed)){
        if(video.destroy) video.destroy()
        else{
            video.src = ""

            video.load()
        }
    }

    if(normalization){
        normalization.destroy()
        normalization = false
    }

    display.empty()

    loader(false)

    listener.send('destroy', {savemeta})
}

function render(){
    return html
}

export default {
    init,
    listener,
    url,
    render,
    destroy,
    playpause,
    rewind,
    play,
    pause,
    size,
    speed,
    subsview,
    to,
    video: ()=> video,
    normalization: ()=> normalization,
    saveParams,
    clearParamas,
    setParams,
    pip,
    volume,
    registerTube: Tube.register,
    removeTube: Tube.remove,
    verifyTube: Tube.verify
}