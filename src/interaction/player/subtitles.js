import Video from './video'
import Player from '../player'
import Cue from './subtitles/cue'
import CustomSubtitles from './subtitles/custom'
import PanelSettings from './panel/settings'
import Storage from '../../core/storage/storage'
import Arrays from '../../utils/arrays'

let custom_subtitles

function init(){
    Player.listener.follow('ready', bind)

    Player.listener.follow('destroy', destroy)

    Video.listener.follow('timeupdate', function(e) {
        if(custom_subtitles) custom_subtitles.update(e.current)
    })

    // Video.listener.follow('destroy', function(e) {
    //     if(custom_subtitles){
    //         custom_subtitles.destroy()
    //         custom_subtitles = null
    //     }
    // })

    PanelSettings.listener.follow('subs', applySettings)
}

/**
 * Применяет к блоку субтитров пользовательские настройки
 */
function applySettings() {
    let stroke   = Storage.field('subtitles_stroke'),
        backdrop = Storage.field('subtitles_backdrop'),
        size     = Storage.field('subtitles_size')

    Cue.render().removeClass('has--stroke has--backdrop size--normal size--large size--small')
    Cue.render().addClass('size--' + size)

    if (stroke)   Cue.render().addClass('has--stroke')
    if (backdrop) Cue.render().addClass('has--backdrop')
}

function bind(data){
    // Субтитры из плеера Tizen
    Video.video().addEventListener('subtitle', function(e) {
        //В srt существует тег {\anX}, где X - цифра от 1 до 9, Тег определяет нестандартное положение субтитра на экране.
        //Здесь удаляется тег из строки и обрабатывается положение 8 (субтитр вверху по центру).
        //{\an8} используется когда нужно, чтобы субтитр не перекрывал надписи в нижней части экрана или субтитры вшитые в видеоряд.
        Cue.render().removeClass('on-top')

        let pos_tag = e.text.match(/^{\\an(\d)}/)

        if(pos_tag) {
            e.text = e.text.replace(/^{\\an(\d)}/, '')

            if(pos_tag[1] && parseInt(pos_tag[1]) === 8) {
                Cue.render().addClass('on-top')
            }
        }

        Cue.draw(e.text.trim())
    })

    applySettings()

    if(data.subtitles) custom(data.subtitles)
}

/**
 * Установить собственные субтитры
 * @param {[{index:integer, label:string, url:string}]} list 
 */
function custom(list){
    if(!Arrays.isArray(list)) return console.log('Player','custom subtitles not array', list)

    let video = Video.video()

    if(custom_subtitles) custom_subtitles.destroy()

    video.customSubs = Arrays.clone(list)

    console.log('Player','custom subtitles', list)

    custom_subtitles = new CustomSubtitles()

    custom_subtitles.listener.follow('subtitle',(e)=>{
        Cue.draw(e.text, e.style)
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
                        custom_subtitles.load(sub.url)
                    }
                },
                get: ()=>{}
            })
        }
    })

    video.customSubs.length > 0 && Video.listener.send('subs', {subs: video.customSubs})
}

function destroy(){
    Cue.draw('')

    if(custom_subtitles){
        custom_subtitles.destroy()
        custom_subtitles = null
    }
}

export default {
    init,
    custom,
    destroy
}