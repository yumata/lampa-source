import Storage from '../../../../core/storage/storage'
import Reguest from '../../../../utils/reguest'
import SimpleAss from './simple'
import Jassub from './jassub'
import Fonts from './fonts'
import Readable from './readable'
import TorFonts from './torfonts'

/**
 * Менеджер ASS-субтитров: выбирает рендерер, загружает файл и привязывает слой к видео.
 *
 * Режимы (Storage 'subtitles_ass_mode'):
 *   auto   - лучший доступный рендерер для устройства (libass на компьютерах, простой на ТВ и слабых устройствах)
 *   full   - полноценный рендерер (libass, JASSUB); если не загрузился - простой
 *   simple - простой DOM-рендерер
 *   text   - без оформления: обычные субтитры (как раньше)
 */

console.log('Subtitles', 'ASS-PATCH-V15 loaded')

let renderers = {
    full: Jassub,
    simple: {
        create: (host)=> new SimpleAss(host),
        supported: ()=> true
    }
}

let current = null
let network = null
let show_token = 0
let fonts_session = null

/**
 * Значение переключателя из настроек Lampa (хранится как 'true'/'false', может быть и булевым)
 * @param {string} name
 * @param {boolean} def - значение, если настройка ещё не сохранялась
 */
function flag(name, def){
    let v = Storage.get(name, '')

    if(v === undefined || v === null || v === '') return def

    return !(v === false || v === 0 || v === '0' || ['false', 'no', 'off'].indexOf(String(v).toLowerCase()) >= 0)
}

function mode(){
    let m = Storage.get('subtitles_ass_mode', 'auto')

    return ['auto', 'full', 'simple', 'text'].indexOf(m) >= 0 ? m : 'auto'
}

/**
 * Включено ли оформление ASS (режим не text)
 */
function enabled(){
    return mode() !== 'text'
}

/**
 * Подключить другой рендерер (например, JASSUB)
 * @param {string} name - 'full'
 * @param {{create:function, supported:function}} renderer
 */
function register(name, renderer){
    renderers[name] = renderer
}

/**
 * Какой рендерер использовать с учётом режима и возможностей устройства
 */
function pick(){
    let m = mode()

    if(m === 'text') return null

    if((m === 'auto' || m === 'full') && renderers.full && renderers.full.supported(m === 'full')) return renderers.full

    return renderers.simple
}

function element(parent){
    return parent && parent.jquery ? parent[0] : parent
}

/**
 * Показать ASS-субтитры
 * @param {string} url - адрес файла (оригинальный ASS)
 * @param {HTMLVideoElement} video
 * @param {object|HTMLElement} parent - контейнер плеера
 * @param {{hash:string}} [ctx] - торрент, из которого берутся шрифты
 */
function show(url, video, parent, ctx){
    hide()

    ctx = ctx || {}

    if(!video || !pick()) return

    let token = ++show_token

    let makeHost = ()=> ({
        parent: element(parent),
        video: video,
        time: ()=>{
            let shift = parseInt(Storage.get('player_subs_shift_time', '0'))

            return video.currentTime - (isNaN(shift) ? 0 : shift)
        },
        rect: ()=>{
            let box = video.getBoundingClientRect()
            let vw  = video.videoWidth
            let vh  = video.videoHeight

            if(!vw || !vh || !box.width || !box.height) return box

            // картинка вписана в элемент video с сохранением пропорций (object-fit: contain)
            let k = Math.min(box.width / vw, box.height / vh)
            let w = vw * k
            let h = vh * k

            return {left: box.left + (box.width - w) / 2, top: box.top + (box.height - h) / 2, width: w, height: h}
        },
        videoHeight: ()=> video.videoHeight || 0
    })

    let run = (renderer, text)=>{
        let host   = makeHost()
        let failed = false

        host.fonts = fonts_session

        // если полноценный рендерер не заработал (нет файлов, ошибка воркера) - переключаемся на простой
        host.onFail = ()=>{
            if(failed || token !== show_token || renderer === renderers.simple) return

            failed = true

            if(current){
                current.destroy()

                current = null
            }

            run(renderers.simple, text)
        }

        current = renderer.create(host)

        current.load(text)
    }

    network = new Reguest()

    network.timeout(30000)

    network.silent(url, (text)=>{
        if(token !== show_token) return

        let renderer = pick()

        if(!renderer) return

        text = String(text)

        // настройки субтитров Lampa (размер, окантовка, подложка) для основных реплик
        let readable = flag('subtitles_ass_readable', true)

        if(readable){
            let source = text

            text = Readable.transform(text, {
                stroke: Storage.field('subtitles_stroke'),
                backdrop: Storage.field('subtitles_backdrop'),
                size: Storage.field('subtitles_size')
            })

            console.log('Subtitles', 'ASS: readability on (stroke ' + Storage.field('subtitles_stroke') + ', backdrop ' + Storage.field('subtitles_backdrop') +
                ', size ' + Storage.field('subtitles_size') + ') - ' + (text !== source ? 'dialogue styles changed' : 'nothing to change'))
        }
        else{
            console.log('Subtitles', 'ASS: readability off (setting=' + Storage.get('subtitles_ass_readable', '') + ') - styles are used as authored, including the author outline')
        }

        // шрифты из торрента: ищем в фоне, рендерер подхватывает их по мере нахождения
        let fonts_on = flag('subtitles_ass_fonts', true)

        if(ctx.hash && fonts_on){
            fonts_session = Fonts.createSession({hash: ctx.hash, text, transport: TorFonts})
        }

        console.log('Subtitles', 'ASS: renderer ' + (renderer === renderers.simple ? 'simple' : 'libass') + ', fonts ' +
            (fonts_session ? 'search started' : (ctx.hash ? 'disabled in settings' : 'skipped (no torrent hash)')))

        run(renderer, text)
    }, ()=>{
        console.log('Subtitles', 'ASS load error', url)
    }, false, {dataType: 'text'})
}

/**
 * Скрыть и уничтожить ASS-слой
 */
function hide(){
    show_token++

    if(fonts_session){
        fonts_session.cancel()

        fonts_session = null
    }

    if(network){
        network.clear()

        network = null
    }

    if(current){
        current.destroy()

        current = null
    }
}

export default {
    mode,
    enabled,
    register,
    show,
    hide
}
