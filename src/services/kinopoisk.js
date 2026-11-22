import Manifest from '../core/manifest'
import Utils from '../utils/utils'
import Platform from '../core/platform'
import Arrays from '../utils/arrays'
import Reguest from '../utils/reguest'

let network = new Reguest()
let list    = []
let map     = {}
let loaded  = false
let waiting = []

/**
 * Можно ли открыть приложение Кинопоиск — только Android-приложение с AndroidJS.openBrowser, не в демо-режиме
 * @returns {boolean}
 */
function available(){
    return !window.lampa_settings.demo && Platform.is('android') && typeof AndroidJS !== 'undefined' && typeof AndroidJS.openBrowser == 'function'
}

/**
 * Загрузка списка карточек, которые смотрят в приложении Кинопоиск (CUB: static/filter/kinopoisk.json).
 * Список не нужен (не Android, выключено) или не загрузился — тоже считается загруженным, ожидающие получают пустой список.
 * @returns {void}
 */
function init(){
    if(window.lampa_settings.disable_features.kinopoisk || !available()) return done()

    network.timeout(1000 * 10)

    network.silent(Utils.protocol() + Manifest.cub_domain + '/api/kinopoisk/list', (data)=>{
        if(data && Arrays.isArray(data.results)){
            data.results.forEach((item)=>{
                if(!item || !item.url) return

                list.push(item)

                if(item.id && item.cat) map[item.cat + '_' + item.id] = item
                if(item.kpid) map['kp_' + item.kpid] = item
            })
        }

        done()
    }, done)
}

/**
 * Список загружен (или не нужен) — вызвать всех ожидающих
 * @returns {void}
 */
function done(){
    if(loaded) return

    loaded = true

    let calls = waiting

    waiting = []

    calls.forEach((call)=>{
        try{
            call()
        }
        catch(e){
            console.log('Kinopoisk', 'ready error:', e.message)
        }
    })
}

/**
 * Выполнить, когда список загружен (или не нужен / не загрузился); если уже загружен — сразу
 * @param {function} call
 * @returns {void}
 */
function ready(call){
    if(loaded) call()
    else waiting.push(call)
}

/**
 * Убрать из списка DMCA карточки, которые смотрят на Кинопоиске: они открываются с кнопкой «Смотреть на Кинопоиске».
 * Вызывать в ready(), иначе список Кинопоиска может быть ещё пуст.
 * @param {array} dcma список DMCA [{id, cat}|{kpid}]
 * @returns {array} список без карточек Кинопоиска
 */
function allow(dcma){
    if(!list.length || !Arrays.isArray(dcma)) return dcma

    return dcma.filter((item)=>{
        if(item && item.id && item.cat && map[item.cat + '_' + item.id]) return false
        if(item && item.kpid && map['kp_' + item.kpid]) return false

        return true
    })
}

/**
 * Найти карточку в списке: по id TMDB и типу или по id Кинопоиска
 * @param {object} card карточка
 * @returns {object|null} {id, cat, kpid, url} или null
 */
function find(card){
    if(!card || !list.length || !available()) return null

    let tmdb = !card.source || card.source == 'tmdb' || card.source == 'cub'
    let cat  = card.name || card.number_of_seasons || card.first_air_date ? 'tv' : 'movie'
    let kpid = parseInt(card.kinopoisk_id || card.kp_id) || 0

    return (tmdb && card.id && map[cat + '_' + card.id]) || (kpid && map['kp_' + kpid]) || null
}

export default {
    init,
    ready,
    find,
    allow
}
