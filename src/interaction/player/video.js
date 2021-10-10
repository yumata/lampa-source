import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Tizen from './tizen'
import Platform from '../../utils/platform'
import Arrays from '../../utils/arrays'
import Storage from '../../utils/storage'

let listener = Subscribe()

let html            = Template.get('player_video')
let display         = html.find('.player-video__display')
let paused          = html.find('.player-video__paused')
let subtitles       = html.find('.player-video__subtitles')
let timer           = {}
let rewind_position = 0
let video
let wait


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
                listener.send('error', {error: 'Не удалось декодировать видео'})
            }
            else if(error.code == 4){
                listener.send('error', {error: 'Видео не найдено или повреждено'})
            }
            else{
                listener.send('error', {error: 'code ['+error.code+'] details ['+msg+']'})
            }
        } 
    })

    // прогресс буферизации
    video.addEventListener('progress', function(e) {
        if(e.percent){
            listener.send('progress', {down: e.percent})
        }
        else{
            var duration =  video.duration;

            if (duration > 0) {
                for (var i = 0; i < video.buffered.length; i++) {
                    if (video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
                        var down = Math.max(0,Math.min(100,(video.buffered.end(video.buffered.length - 1 - i) / duration) * 100)) + "%";

                        listener.send('progress', {down: down})

                        break;
                    }
                }
            }
        }
    })

    // можно ли уже проигрывать?
    video.addEventListener('canplay', function() {
        listener.send('canplay', {})

        loaded()
    })

    // сколько прошло
    video.addEventListener('timeupdate', function() {
        listener.send('timeupdate', {duration: video.duration, current: video.currentTime})
    })

    // обновляем субтитры
    video.addEventListener('subtitle', function(e) {
        subtitles.html(e.text)
    })

    video.addEventListener('loadedmetadata', function (e) {
        listener.send('videosize',{width: video.videoWidth, height: video.videoHeight})
    })

    // для страховки
    video.volume = 1
    video.muted  = false
}

/**
 * Смотрим есть ли дорожки и сабы
 */
function loaded(){
    let tracks = video.audioTracks
    let subs   = video.textTracks

    console.log(tracks)

    if(tracks && tracks.length){
        if(!Arrays.isArray(tracks)){
            let new_tracks = []

            for (let index = 0; index < tracks.length; index++) {
                new_tracks.push(tracks[index])
            }

            tracks = new_tracks
        }

        listener.send('tracks', {tracks: tracks})
    } 
    if(subs && subs.length){
        if(!Arrays.isArray(subs)){
            let new_subs = []

            for (let index = 0; index < subs.length; index++) {
                new_subs.push(subs[index])
            }

            subs = new_subs
        }

        listener.send('subs', {subs: subs})
    }  
}

/**
 * Включить или выключить субтитры
 * @param {Boolean} status 
 */
function subsview(status){
    subtitles.toggleClass('hide', !status)
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
    } 
    
    display.append(videobox)

    bind()
}

/**
 * Показать згразку или нет
 * @param {Boolean} status 
 */
function loader(status){
    wait = status

    html.toggleClass('video--load', status)
}

/**
 * Устанавливаем ссылку на видео
 * @param {String} src 
 */
function url(src){
    loader(true)

    create()

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
 * @param {Boolean} immediately - завершить немедленно
 */
function rewindEnd(immediately){
    clearTimeout(timer.rewind_call)

    timer.rewind_call = setTimeout(function(){
        video.currentTime = rewind_position

        rewind_position = 0

        play()
    },immediately ? 0 : 500)
}

/**
 * Подготовка к перемотке
 * @param {Int} position_time - новое время
 * @param {Boolean} immediately - завершить немедленно
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
 * @param {Boolean} forward - направление, true - вперед
 * @param {Int} custom_step - свое значение в секундах
 */
function rewind(forward, custom_step){
    if(video.duration){
        var time = Date.now(),
            step = video.duration / (30 * 60),
            mini = time - (timer.rewind || 0) > 50 ? 20 : 60

        if(rewind_position == 0) rewind_position = video.currentTime

        if(forward){
            rewind_position += Math.min(mini,custom_step || 30 * step)
        }
        else{
            rewind_position -= Math.min(mini,custom_step || 30 * step)
        }

        rewindStart(rewind_position)
    }
}

/**
 * Размер видео, масштаб
 * @param {String} type 
 */
function size(type){
    html.attr('data-size',type)

    if(video.size) video.size(type)
}

/**
 * Перемотка на позицию 
 * @param {Float} type 
 */
function to(seconds){
    pause()

    video.currentTime = seconds

    play()
}

/**
 * Уничтожить
 */
function destroy(){
    subsview(false)

    if(video.destroy) video.destroy()
    else{
        video.src = ""

        video.load()
    } 

    display.empty()

    loader(false)
}

function render(){
    return html
}

export default {
    listener,
    url,
    render,
    destroy,
    playpause,
    rewind,
    play,
    pause,
    size,
    subsview,
    to
}