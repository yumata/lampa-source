import Video from './video'
import Player from '../player'
import Cue from './subtitles/cue'
import CustomSubtitles from './subtitles/custom'
import PanelSettings from './panel/settings'
import Storage from '../../core/storage/storage'
import Lang from '../../core/lang'
import Noty from '../noty'
import Playlist from './playlist'
import Arrays from '../../utils/arrays'
import TorserverSubs from './subtitles/torserver'
import AssSubtitles from './subtitles/ass'
import {preferredSubtitle} from './track_info'

let custom_subtitles
let torserver_subs
let torserver_token = 0
let active_sub
let current_hash = ''
let memo = null
let pending_memo = null

const MEMO_TTL = 60000

function init(){
    Player.listener.follow('ready', bind)

    Player.listener.follow('destroy', destroy)

    // переключение серии: запоминаем выбранные субтитры, чтобы выбрать такие же в следующей серии
    Playlist.listener.follow('select', rememberSelection)

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

    current_hash = data.torrent_hash || ''

    // выбор из предыдущей серии того же торрента (только при переключении серии, не при ручном запуске)
    pending_memo = memo && memo.hash && memo.hash === current_hash && Date.now() - memo.at < MEMO_TTL ? memo : null
    memo         = null

    if(data.subtitles) custom(data.subtitles)

    loadTorserverSubs(data)
}

/**
 * Субтитры торрента от TorrServer (/subs): замена списка, собранного по именам файлов
 * @param {object} data - данные плеера
 */
/**
 * Включён ли механизм субтитров через TorrServer (настройка «Источник субтитров торрента»).
 * Режим legacy - прежнее поведение Lampa: список по именам файлов, без запросов к /subs и без оформления ASS.
 */
let old_server_notified = false

/**
 * Один раз за сеанс подсказать, что для субтитров через TorrServer нужна версия MatriX.147 или новее
 */
function notifyOldServer(){
    if(old_server_notified) return

    old_server_notified = true

    Noty.show(Lang.translate('settings_player_subs_torserver_version'))
}

function useTorserver(){
    return Storage.get('subtitles_source', 'torserver') !== 'legacy'
}

function loadTorserverSubs(data){
    stopTorserverSubs()

    if(!useTorserver() || !TorserverSubs.available(data)) return

    let token = ++torserver_token

    torserver_subs = TorserverSubs.load(data, (list)=>{
        if(token !== torserver_token || !list.length) return

        custom(list, true)
    }, ()=>{
        if(token === torserver_token) notifyOldServer()
    })
}

function stopTorserverSubs(){
    torserver_token++

    if(torserver_subs){
        torserver_subs.destroy()

        torserver_subs = null
    }
}

function normLabel(label){
    return String(label || '').toLowerCase().replace(/\.(ass|ssa|srt|vtt|sub)\b/g, '').replace(/\s*·\s*ass\b/g, '').replace(/\d+/g, '#').replace(/\s+/g, ' ').trim()
}

/**
 * Запомнить выбранные субтитры (вызывается при переключении серии, пока выбор ещё не сброшен)
 */
function rememberSelection(){
    memo = active_sub ? {
        hash: current_hash,
        label: normLabel(active_sub.label),
        lang: active_sub.lang || '',
        ass: Boolean(active_sub.ass),
        index: active_sub.index,
        at: Date.now()
    } : null
}

/**
 * Найти в новом списке дорожку, похожую на ту, что была выбрана в предыдущей серии
 */
function matchSub(subs, m){
    let best  = null
    let score = 0

    subs.forEach((sub)=>{
        let s = 0

        if(normLabel(sub.label) === m.label) s += 10
        if(m.lang && sub.lang === m.lang)    s += 4
        if(Boolean(sub.ass) === m.ass)       s += 2
        if(sub.index === m.index)            s += 1

        if(s > score){
            best  = sub
            score = s
        }
    })

    return score >= 6 ? best : null
}

/**
 * Остановить ASS-слой
 */
function stopAss(){
    active_sub = null

    AssSubtitles.hide()
}

/**
 * Показать выбранные субтитры: ASS - отдельным слоем с оформлением, остальное - как раньше
 * @param {object} sub
 */
function showSub(sub){
    if(active_sub === sub) return

    stopAss()

    active_sub = sub

    if(sub.ass && AssSubtitles.enabled()){
        if(custom_subtitles) custom_subtitles.reset()

        Cue.draw('')

        AssSubtitles.show(sub.url, Video.video(), Video.render(), {hash: sub.hash || current_hash})
    }
    else if(custom_subtitles){
        custom_subtitles.load(sub.ass && sub.vtt ? sub.vtt : sub.url)
    }
}

/**
 * Автовыбор субтитров, если список пришёл уже после начала воспроизведения
 */
function pickSubtitle(subs){
    if(pending_memo){
        let found = matchSub(subs, pending_memo)

        pending_memo = null

        if(found){
            found.mode     = 'showing'
            found.selected = true

            Cue.render().removeClass('hide')

            return
        }
    }

    if(!Storage.field('subtitles_start')) return

    let code = Storage.field('subtitles_lang')
    let pick = preferredSubtitle(subs, code == 'auto' ? Storage.get('language','ru') : code)

    if(pick){
        pick.mode     = 'showing'
        pick.selected = true

        Cue.render().removeClass('hide')
    }
}

/**
 * Установить собственные субтитры
 * @param {[{index:integer, label:string, url:string}]} list 
 * @param {boolean} [autoselect] - выбрать дорожку по настройкам (если список пришёл позже старта)
 */
function custom(list, autoselect){
    if(!Arrays.isArray(list)) return console.log('Player','custom subtitles not array', list)

    let video = Video.video()

    if(!video) return console.log('Player','custom subtitles skipped, not inner player')

    if(custom_subtitles) custom_subtitles.destroy()

    stopAss()

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

        // субтитры из списка по именам файлов тоже могут быть ASS - определяем по расширению
        if(typeof sub.ass == 'undefined') sub.ass = useTorserver() && /\.(ass|ssa)(\?|#|$)/i.test(String(sub.url || ''))

        if(!sub.ready){
            sub.ready = true

            Object.defineProperty(sub, "mode", {
                set: (v)=>{
                    if(v == 'showing') showSub(sub)
                    else if(v == 'disabled' && active_sub === sub) stopAss()
                },
                get: ()=>{}
            })
        }
    })

    if(autoselect && video.customSubs.length) pickSubtitle(video.customSubs)

    video.customSubs.length > 0 && Video.listener.send('subs', {subs: video.customSubs})
}

function destroy(){
    stopTorserverSubs()

    stopAss()

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