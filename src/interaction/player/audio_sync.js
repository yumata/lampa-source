import Video from './video'

/**
 * Внешняя аудиодорожка для обычного потока (/stream): отдельный файл играет в скрытом элементе <audio>,
 * который держится в такт с <video> (пауза, перемотка, скорость, громкость), а звук самого видео выключается.
 *
 * Браузер должен уметь воспроизводить формат аудиофайла (aac, mp3, opus, flac, часто mka с этими кодеками);
 * ac3/eac3/dts в большинстве браузеров не играют - тогда вызывается onFail и звук возвращается видео.
 *
 * Расхождение исправляется без перемотки аудио: небольшое - лёгким изменением скорости (тон сохраняется),
 * перемотка только при большом расхождении и перемотке видео. Каждая перемотка <audio> - это новый запрос
 * к торренту и пауза в звуке, поэтому лишних перемоток здесь нет.
 */

const SOFT_DRIFT = 0.08 // сек, ниже - расхождение не трогаем
const HARD_DRIFT = 1.2  // сек, выше - перематываем аудио
const NUDGE      = 0.04 // на сколько ускоряем или замедляем аудио при расхождении
const REALIGN_MS = 4000 // не чаще одной аварийной перемотки за это время

let video    = null
let audio    = null
let handlers = []
let aligned  = 0

function on(el, name, fn){
    el.addEventListener(name, fn)

    handlers.push([el, name, fn])
}

/**
 * Перемотать аудио на позицию видео
 */
function seek(){
    if(!audio || !video) return

    aligned = Date.now()

    try{ audio.currentTime = video.currentTime }
    catch(e){}
}

/**
 * Подтянуть звук к видео, не перематывая
 */
function adjust(){
    if(!audio || !video || video.paused || video.seeking || audio.seeking) return

    // звук ещё не загружен: перематывать бесполезно, ждём
    if(audio.readyState < 3) return

    let rate = video.playbackRate || 1
    let diff = audio.currentTime - video.currentTime // больше нуля - звук опережает

    if(Math.abs(diff) > HARD_DRIFT){
        if(Date.now() - aligned > REALIGN_MS) seek()
    }
    else if(Math.abs(diff) > SOFT_DRIFT){
        audio.playbackRate = rate * (diff > 0 ? 1 - NUDGE : 1 + NUDGE)
    }
    else audio.playbackRate = rate
}

function play(){
    if(!audio || !video || video.paused || video.seeking) return

    let promise = audio.play()

    if(promise && promise.catch) promise.catch(()=>{})
}

/**
 * Включить внешнюю дорожку
 * @param {string} url - ссылка на аудиофайл
 * @param {function} onFail - файл не удалось воспроизвести
 */
function start(url, onFail){
    stop()

    video = Video.video()

    if(!video) return

    audio = new Audio()

    audio.preload      = 'auto'
    audio.volume       = video.volume
    audio.playbackRate = video.playbackRate
    audio.src          = url

    video.muted = true

    on(video, 'play',         play)
    on(video, 'playing',      play)
    on(video, 'pause',        ()=> audio && audio.pause())
    on(video, 'waiting',      ()=> audio && audio.pause())
    on(video, 'seeking',      ()=> audio && audio.pause())
    on(video, 'seeked',       ()=> { seek(); play() })
    on(video, 'ended',        ()=> audio && audio.pause())
    on(video, 'ratechange',   ()=> audio && (audio.playbackRate = video.playbackRate))
    on(video, 'volumechange', ()=> audio && (audio.volume = video.volume))
    on(video, 'timeupdate',   adjust)

    // canplay приходит после каждой загрузки и перемотки: только продолжаем играть, позицию не трогаем
    on(audio, 'canplay', play)
    on(audio, 'error',   ()=> {
        console.log('Player', 'external audio error', audio && audio.error)

        stop()

        if(onFail) onFail()
    })

    seek()
    play()
}

/**
 * Выключить внешнюю дорожку и вернуть звук видео
 */
function stop(){
    handlers.forEach(h=> h[0].removeEventListener(h[1], h[2]))

    handlers = []

    if(audio){
        audio.pause()
        audio.removeAttribute('src')
        audio.load()

        audio = null
    }

    if(video){
        video.muted = false

        video = null
    }
}

function active(){
    return Boolean(audio)
}

export default {
    start,
    stop,
    active
}
