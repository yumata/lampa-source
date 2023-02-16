import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Tizen from './tizen'
import WebOS from './webos'
import Platform from '../../utils/platform'
import Arrays from '../../utils/arrays'
import Storage from '../../utils/storage'
import CustomSubs from './subs'
import Normalization from './normalization'
import Lang from '../../utils/lang'
import Panel from './panel'
import Utils from '../../utils/math'
import DeviceInput from '../../utils/device_input'

let listener = Subscribe()
let html
let display
let paused
let subtitles
let backworkIcon
let forwardIcon

let timer           = {}
let params          = {}
let rewind_position = 0
let rewind_force    = 0
let last_mutation   = 0
let customsubs
let video
let wait
let neeed_sacle
let neeed_sacle_last
let neeed_speed
let webos
let hls
let dash
let webos_wait = {}
let normalization

let click_nums = 0
let click_timer

function init(){
    html      = Template.get('player_video')
    display   = html.find('.player-video__display')
    paused    = html.find('.player-video__paused')
    subtitles = html.find('.player-video__subtitles')

    backworkIcon = html.find('.player-video__backwork-icon')
    forwardIcon  = html.find('.player-video__forward-icon')

    html.find('.player-video__backwork-icon,.player-video__forward-icon').on('animationend', function () {
        $(this).removeClass('rewind')
    })

    html.on('click',(e)=>{
        if((Storage.field('navigation_type') == 'mouse' || Utils.isTouchDevice()) && DeviceInput.canClick(e.originalEvent)){
            clearTimeout(click_timer)
            
            click_nums++

            if (click_nums === 1) {
                click_timer = setTimeout(() => {
                    click_nums = 0

                    if(Panel.visibleStatus()) playpause()
                    else Panel.mousemove()
                }, 300)
            }
            else if (click_nums > 1) {
                click_timer = setTimeout(() => {
                    let dir = e.clientX > window.innerWidth / 2 ? 1 : -1
                    let pow = (click_nums - 1) * 10

                    if(dir == 1){
                        forwardIcon.addClass('rewind').find('span').text('+' + pow + ' sec')
                    }
                    else{
                        backworkIcon.addClass('rewind').find('span').text('-' + pow + ' sec')
                    }
                    
                    to(video.currentTime + dir * pow)

                    click_nums = 0
                }, 300)
            }
        } 
    })

    $(window).on('resize',()=>{
        if(video){
            neeed_sacle = neeed_sacle_last

            scale()
        } 
    })

    /**
     * Специально для вебось
     */
    listener.follow('webos_subs',(data)=>{
        webos_wait.subs = convertToArray(data.subs)
    })

    listener.follow('webos_tracks',(data)=>{
        webos_wait.tracks = convertToArray(data.tracks)
    })
}

/**
 * Переключаем субтитры с предыдущей серии
 */
function webosLoadSubs(){
    let subs = webos_wait.subs

    video.webos_subs = subs
    
    let inx = params.sub + 1

    if(typeof params.sub !== 'undefined' && subs[inx]){
        subs.forEach(e=>{e.mode = 'disabled'; e.selected = false})

        subs[inx].mode     = 'showing'
        subs[inx].selected = true

        console.log('WebOS','enable subs', inx)

        subsview(true)
    }
    else if(Storage.field('subtitles_start')){
        let full = subs.find(s=>(s.label || '').indexOf('олные') >= 0)

        subs[0].selected = false
         
        if(full){
            full.mode     = 'showing'
            full.selected = true
        }
        else{
            subs[1].mode     = 'showing'
            subs[1].selected = true
        }
        
        subsview(true)
    }
}

/**
 * Переключаем дорожки с предыдущей серии
 */
function webosLoadTracks(){
    let tracks = webos_wait.tracks

    video.webos_tracks = tracks

    if(typeof params.track !== 'undefined' && tracks[params.track]){
        tracks.forEach(e=>e.selected = false)

        console.log('WebOS','enable tracks', params.track)

        tracks[params.track].enabled  = true
        tracks[params.track].selected = true
    }
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

    // что-то пошло не так
    video.addEventListener('error', function(e){
        let error = video.error || {}
        let msg   = (error.message || '').toUpperCase();

        if(msg.indexOf('EMPTY SRC') == -1){
            if(error.code == 3){
                listener.send('error', {error: Lang.translate('player_error_one')})
            }
            else if(error.code == 4){
                listener.send('error', {error: Lang.translate('player_error_two')})
            }
            else if(typeof error.code !== 'undefined'){
                listener.send('error', {error: 'code ['+error.code+'] details ['+msg+']'})
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
                for (let i = 0; i < video.buffered.length; i++) {
                    if (video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
                        let down = Math.max(0,Math.min(100,(video.buffered.end(video.buffered.length - 1 - i) / duration) * 100)) + "%";

                        seconds = Math.max(0,video.buffered.end(video.buffered.length - 1 - i) - video.currentTime)

                        listener.send('progress', {down: down})

                        break
                    }
                }

                hlsBitrate(seconds)
            }
        }
    })

    // можно ли уже проигрывать?
    video.addEventListener('canplay', function() {
        listener.send('canplay', {})
    })

    // сколько прошло
    video.addEventListener('timeupdate', function() {
        if(rewind_position == 0) listener.send('timeupdate', {duration: video.duration, current: video.currentTime})

        listener.send('videosize',{width: video.videoWidth, height: video.videoHeight})

        scale()

        mutation()

        if(customsubs) customsubs.update(video.currentTime)
    })

    // обновляем субтитры
    video.addEventListener('subtitle', function(e) {
        //В srt существует тег {\anX}, где X - цифра от 1 до 9, Тег определяет нестандартное положение субтитра на экране.
        //Здесь удаляется тег из строки и обрабатывается положение 8 (субтитр вверху по центру).
        //{\an8} используется когда нужно, чтобы субтитр не перекрывал надписи в нижней части экрана или субтитры вшитые в видеоряд.
        subtitles.removeClass('on-top');
        const posTag = e.text.match(/^{\\an(\d)}/);
        if(posTag) {
            e.text = e.text.replace(/^{\\an(\d)}/, '');
            if(posTag[1] && parseInt(posTag[1]) === 8) {
                subtitles.addClass('on-top');
            }
        }

        e.text = e.text.trim()

        $('> div',subtitles).html(e.text ? e.text : '&nbsp;').css({
            display: e.text ? 'inline-block' : 'none'
        })

        clearTimeout(timer.subtitle)

        timer.subtitle = setTimeout(function(){
            $('> div',subtitles).html('&nbsp;').css({
                display: 'none'
            })
        }, 10000)
    })

    //получены первые данные
    video.addEventListener('loadeddata', function (e) {
        listener.send('videosize',{width: video.videoWidth, height: video.videoHeight})

        scale()

        if(neeed_speed) speed(neeed_speed)

        loaded()
    })

    // для страховки
    video.volume = 1
    video.muted  = false
}

function hlsBitrate(seconds) {
    if (hls && hls.streamController && hls.streamController.fragPlaying && hls.streamController.fragPlaying.baseurl) {
        let ch = Lang.translate('title_channel') + ' ' + parseFloat(hls.streamController.fragLastKbps / 1024).toFixed(2) + ' Mbs'
        let bt = ' / ' + Lang.translate('torrent_item_bitrate') + ' ~' + parseFloat(hls.streamController.fragPlaying.stats.total / 1000000 / 10 * 8).toFixed(2) + ' Mbs'
        let bf = ' / ' + Lang.translate('title_buffer') + ' '+Utils.secondsToTimeHuman(seconds)

        Lampa.PlayerInfo.set('bitrate', ch + bt + bf)
    }
}

/**
 * Может поможет избавится от скринсейва
 */
function mutation(){
    if (last_mutation < Date.now() - 5000) {
        let style = video.style

        style.top    = style.top
        style.left   = style.left
        style.width  = style.width
        style.height = style.height

        last_mutation = Date.now()
    }
}

/**
 * Конвертировать object to array
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
    if(!neeed_sacle) return

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

    if(neeed_sacle == 'default'){
        rt = Math.min(window.innerWidth / vw,  window.innerHeight / vh)
    }
    else if(neeed_sacle == 'fill'){
        rt = Math.min(window.innerWidth / vw,  window.innerHeight / vh)

        sx = window.innerWidth / (vw * rt)
        sy = window.innerHeight / (vh * rt)
    }
    else if(neeed_sacle == 's115'){
        increase(1.15, 1.15)
    }
    else if(neeed_sacle == 's130'){
        increase(1.34, 1.34)
    }
    else if(neeed_sacle == 'v115'){
        increase(1.01, 1.15)
    }
    else if(neeed_sacle == 'v130'){
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
    
    if(Platform.is('orsay') || Storage.field('player_scale_method') == 'calculate'){
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

    neeed_sacle = false
}

/**
 * Сохранить текущие состояние дорожек и сабов
 * @returns {{sub:integer, track:integer, level:integer}}
 */
function saveParams(){
    let subs   = video.customSubs || video.webos_subs || video.textTracks || []
    let tracks = []

    if(hls && hls.audioTracks && hls.audioTracks.length)   tracks = hls.audioTracks
    else if(dash)   tracks = dash.getTracksFor('audio')
    else if(video.audioTracks && video.audioTracks.length) tracks = video.audioTracks

    if(webos && webos.sourceInfo) tracks = video.webos_tracks || []

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

    if(hls && hls.levels) params.level = hls.currentLevel
    if(dash) params.level = dash.getQualityFor('video')

    console.log('WebOS','saved params', params)

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

    console.log('WebOS','video full loaded')

    if(hls) console.log('Player','hls test', hls.audioTracks.length)

    if(hls && hls.audioTracks && hls.audioTracks.length){
        tracks = hls.audioTracks

        tracks.forEach(track=>{
            if(hls.audioTrack == track.id) track.selected = true

            Object.defineProperty(track, "enabled", {
                set: (v)=>{
                    if(v) hls.audioTrack = track.id
                },
                get: ()=>{}
            })
        }) 
    }
    else if(dash){
        tracks = dash.getTracksFor('audio')

        tracks.forEach((track,i)=>{
            if(i == 0) track.selected = true

            track.language = (track.lang + '').replace(/\d+/g,'')

            Object.defineProperty(track, "enabled", {
                set: (v)=>{
                    if(v) dash.setCurrentTrack(track)
                },
                get: ()=>{}
            })
        })
    }
	else if(video.audioTracks && video.audioTracks.length) tracks = video.audioTracks

    console.log('Player','tracks', video.audioTracks)

    if(webos && webos.sourceInfo){
        tracks = []

        if(webos_wait.tracks) webosLoadTracks()
        if(webos_wait.subs)   webosLoadSubs()
    } 

    if(tracks.length){
        tracks = convertToArray(tracks)

        if(typeof params.track !== 'undefined' && tracks[params.track]){
            tracks.forEach(e=>{e.selected = false})

            tracks[params.track].enabled = true
            tracks[params.track].selected = true

            console.log('WebOS','enable track by default')
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

    if(hls && hls.levels){
        let current_level = 'AUTO'

        hls.levels.forEach((level,i)=>{
            level.title = level.qu ? level.qu : level.width ? level.width + 'x' + level.height : 'AUTO'

            if(hls.currentLevel == i){
                current_level  = level.title

                level.selected = true
            } 

            Object.defineProperty(level, "enabled", {
                set: (v)=>{
                    if(v){
                        hls.currentLevel = i

                        hls.levels.map(e=>e.selected = false)

                        level.selected = true
                    }
                },
                get: ()=>{}
            })
        })

        if(typeof params.level !== 'undefined' && hls.levels[params.level]){
            hls.levels.map(e=>e.selected = false)

            hls.levels[params.level].enabled = true
            hls.levels[params.level].selected = true

            current_level = hls.levels[params.level].title
        }
        else{
            if(hls.currentLevel >= 0) current_level = hls.levels[hls.currentLevel].title
        }

        listener.send('levels', {levels: hls.levels, current: current_level})
    }

    if(dash){
        let bitrates = dash.getBitrateInfoListFor("video"),current_level = 'AUTO'
        
        bitrates.forEach((level, i)=>{
            level.title = level.width ? level.width + 'x' + level.height : 'AUTO'

            if(i == 0) current_level = level.title

            Object.defineProperty(level, "enabled", {
                set: (v)=>{
                    if(v){
                        dash.getSettings().streaming.abr.autoSwitchBitrate = false

                        dash.setQualityFor("video", level.qualityIndex)
                    } 
                },
                get: ()=>{}
            })
        })

        if(typeof params.level !== 'undefined' && bitrates[params.level]){
            bitrates.map(e=>e.selected = false)

            dash.getSettings().streaming.abr.autoSwitchBitrate = false

            bitrates[params.level].enabled = true
            bitrates[params.level].selected = true

            current_level = bitrates[params.level].title
        }
        
        listener.send('levels', {levels: bitrates, current: current_level})
    }
}

function HLSLevelsDefault(){
    let start_level = hls.levels.find((level,i)=>{
        let level_width  = level.width || 0
        let level_height = level.height || 0

        let quality_width  = Math.round(Storage.field('video_quality_default') * 1.777)
        let quality_height = Storage.field('video_quality_default')

        let w = level_width > quality_width - 100 && level_width < quality_width + 100
        let h = level_height > quality_height - 100 && level_height < quality_height + 100

        return w || h
    })

    return start_level ? hls.levels.indexOf(start_level) : hls.currentLevel
}

/**
 * Установить собственные субтитры
 * @param {[{index:integer, label:string, url:string}]} subs 
 */
function customSubs(subs){
    video.customSubs = Arrays.clone(subs)

    console.log('Player','custom subs', subs)

    customsubs = new CustomSubs()

    customsubs.listener.follow('subtitle',(e)=>{
        $('> div',subtitles).html(e.text ? e.text : '&nbsp;').css({
            display: e.text ? 'inline-block' : 'none'
        })
    })

    let index = -1

    video.customSubs.forEach((sub)=>{
        index++

        if(typeof sub.index == 'undefined') sub.index = index

        if(!sub.ready){
            sub.ready = true

            Object.defineProperty(sub, "mode", {
                set: (v)=>{
                    if(v == 'showing'){
                        customsubs.load(sub.url)
                    }
                },
                get: ()=>{}
            })
        }
    })
}

/**
 * Включить или выключить субтитры
 * @param {boolean} status 
 */
function subsview(status){
    subtitles.toggleClass('hide', !status)
}

/**
 * Применяет к блоку субтитров пользовательские настройки
 */
function applySubsSettings() {
    const hasStroke   = Storage.field('subtitles_stroke'),
          hasBackdrop = Storage.field('subtitles_backdrop'),
          size        = Storage.field('subtitles_size');

    subtitles.removeClass('has--stroke has--backdrop size--normal size--large size--small');
    subtitles.addClass('size--' + size);

    if (hasStroke) {
        subtitles.addClass('has--stroke');
    }

    if (hasBackdrop) {
        subtitles.addClass('has--backdrop');
    }
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
    else{
        videobox = $('<video class="player-video__video" poster="./img/video_poster.png" crossorigin="anonymous"></video>')

        video = videobox[0]

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

    applySubsSettings()

    display.append(videobox)

    if(Platform.is('webos') && !webos){
        webos = new WebOS(video)
        webos.callback = ()=>{
            let src = video.src
            let sub = video.customSubs

            console.log('WebOS','video loaded')

            $(video).remove()

            if(normalization) normalization.destroy()

            url(src)

            video.customSubs = sub

            webos.repet(video)

            listener.send('reset_continue',{})
        }
        webos.start()
    }

    bind()
}

function normalizationVisible(status){
    if(normalization) normalization.visible(status)
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
 * @param {string} src 
 */
 function url(src){
    loader(true)

    if(hls){
        hls.destroy()
        hls = false
    }

    if(dash){
        dash.destroy()
        dash = false
    }

    create()

    if(/\.mpd/.test(src) && typeof dashjs !== 'undefined'){
        try{
            dash = dashjs.MediaPlayer().create()

            dash.getSettings().streaming.abr.autoSwitchBitrate = false

            dash.initialize(video, src, true)
        }
        catch(e){
            console.log('Player','Dash error:', e.stack)

            load(src)
        }
    }
    else if(/\.m3u8/.test(src) && typeof Hls !== 'undefined'){
        if(navigator.userAgent.toLowerCase().indexOf('maple') > -1) src += '|COMPONENT=HLS'

        if(Storage.field('player_hls_method') == 'application' && video.canPlayType('application/vnd.apple.mpegurl')){
            console.log('Player','use hls:', 'application')

            load(src)
        }
        else if(Hls.isSupported() && !(Platform.is('tizen') && Storage.field('player') == 'tizen')) {
            console.log('Player','use hls:', 'program')

            try{
                hls = new Hls()
                hls.attachMedia(video)
                hls.loadSource(src)
                hls.on(Hls.Events.ERROR, function (event, data){
                    if(data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR){
                        if(data.reason === "no EXTM3U delimiter") {
                            load(src)
                        }
                        else{
                            listener.send('error', {error: 'details ['+data.details+'] fatal ['+data.fatal+']'})
                        }
                    }
                    else{
                        listener.send('error', {error: 'details ['+data.details+'] fatal ['+data.fatal+']'})
                    }
                })
                hls.on(Hls.Events.MANIFEST_LOADED, function(){
                    play()
                })
                hls.on(Hls.Events.MANIFEST_PARSED, function(){
                    hls.currentLevel = HLSLevelsDefault()
                })
            }
            catch(e){
                console.log('Player', 'HLS play error:', e.message)
    
                load(src)
            }
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
    video.src = src

    video.load()

    play()
}

/**
 * Играем
 */
function play(){
    var playPromise;

    try{
        playPromise = video.play()
    }
    catch(e){ }


    if (playPromise !== undefined) {
        playPromise.then(function(){
            console.log('Player','start plaining')
        })
        .catch(function(e){
            console.log('Player','play promise error:', e.message)
        });
    }

    paused.addClass('hide')

    listener.send('play',{})
}

/**
 * Пауза
 */
function pause(){
    let pausePromise;

    try{
        pausePromise = video.pause()
    }
    catch(e){ }

    if (pausePromise !== undefined) {
        pausePromise.then(function(){
            console.log('Player','pause')
        })
        .catch(function(e){
            console.log('Player','pause promise error:', e.message)
        });
    }

    paused.removeClass('hide')

    listener.send('pause',{})
}

/**
 * Играем или пауза
 */
function playpause(){
    if(wait || rewind_position) return

    if(video.paused){
        play()

        listener.send('play', {})
    }  
    else{
        pause()

        listener.send('pause', {})
    }
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

        if(webos) webos.rewinded()
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
        var time = Date.now(),
            step = video.duration / (30 * 60),
            mini = time - (timer.rewind || 0) > 50 ? 20 : 60

        if(rewind_position == 0){
            rewind_force = Math.min(mini,custom_step || 30 * step)

            rewind_position = video.currentTime
        }

        rewind_force *= 1.03

        if(forward){
            rewind_position += rewind_force
        }
        else{
            rewind_position -= rewind_force
        }

        rewindStart(rewind_position)
    }
}

/**
 * Размер видео, масштаб
 * @param {string} type
 */
function size(type){
    neeed_sacle = type
    neeed_sacle_last = type

    scale()

    if(video.size) video.size(type)
}

function speed(value){
    neeed_speed = value

    let fv = value == 'default' ? 1 : parseFloat(value)

    if(video.speed) video.speed(fv)
    else if(webos) webos.speed(fv)
    else video.playbackRate = fv
}

/**
 * Перемотка на позицию 
 * @param {number} type 
 */
function to(seconds){
    pause()

    if(seconds == -1) video.currentTime = video.duration - 3
    else video.currentTime = seconds

    play()
}

function enterToPIP(){
    if (!document.pictureInPictureElement && document.pictureInPictureEnabled && video.requestPictureInPicture) {
        video.requestPictureInPicture()
    }
}

function exitFromPIP(){
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture()
    }
}

function togglePictureInPicture(){
    if(document.pictureInPictureElement) exitFromPIP()
    else enterToPIP()
}

/**
 * Уничтожить
 * @param {boolean} type - сохранить с параметрами
 */
function destroy(savemeta){
    subsview(false)

    neeed_sacle = false

    paused.addClass('hide')

    if(webos) webos.destroy()

    $('> div',subtitles).empty()

    webos = null
    webos_wait = {}

    clearTimeout(click_timer)

    let hls_destoyed  = false
    let dash_destoyed = false

    if(hls){
        hls.destroy()
        hls = false

        hls_destoyed = true
    }

    if(dash){
        dash.destroy()
        dash = false

        dash_destoyed = true
    }

    if(!savemeta){
        if(customsubs){
            customsubs.destroy()
            customsubs = false
        }
    }

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
    customSubs,
    to,
    video: ()=> { return video },
    saveParams,
    clearParamas,
    setParams,
    normalizationVisible,
    togglePictureInPicture
}