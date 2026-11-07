import Permit from './permit'
import Socket from '../socket'
import Player from '../../interaction/player'
import Video from '../../interaction/player/video'
import Activity from '../../interaction/activity/activity'

let timer
let last  // последнее отправленное {method, id, title, img}

let REPEAT = 1000 * 120

/**
 * Что сейчас смотрим: карточка из данных плеера или из привязки тайм-кода (только tmdb / cub)
 * @param {object} data - объект, с которым запустили плеер
 * @returns {object|null} - {method, id, title, img}
 */
function extract(data){
    if(!data || data.iptv || data.tv || typeof data.url !== 'string' || Video.verifyTube(data.url)) return null

    let active = Activity.active() || {}
    let card   = data.card && typeof data.card == 'object' ? data.card : active.movie || null
    let method, id

    if(card && card.id){
        let source = (card.source || 'tmdb') + ''

        if(source !== 'tmdb' && source !== 'cub') return null

        method = card.original_name || card.name ? 'tv' : 'movie'
        id     = parseInt(card.id)
    }
    else if(data.timeline && typeof data.timeline.card == 'string'){
        let match = data.timeline.card.match(/^(tv|movie)_(\d+)$/)

        if(!match) return null

        method = match[1]
        id     = parseInt(match[2])
    }

    if(!method || !id || isNaN(id)) return null

    // Название и картинка — только если это та же карточка
    if(!card || parseInt(card.id) !== id) card = active.movie && parseInt(active.movie.id) === id ? active.movie : {}

    return {
        method,
        id,
        title: ((card.title || card.name || '') + '').slice(0, 200),
        img: card.backdrop_path || card.poster_path || ''
    }
}

function send(params){
    if(Permit.token) Socket.send('watching', {params})
}

function start(data){
    let next = extract(data)

    // Не карточка (IPTV, YouTube…) — сбрасываем прошлое «смотрит»
    if(!next) return stop()

    clearInterval(timer)

    last = next

    send(last)

    timer = setInterval(()=>{
        if(Player.opened() && last) send(last)
        else stop()
    }, REPEAT)
}

function stop(){
    clearInterval(timer)

    timer = null

    if(last){
        last = null

        send({stop: true})
    }
}

function init(){
    if(!window.lampa_settings.account_use || window.lampa_settings.disable_features.friends) return

    Player.listener.follow('start', start)
    Player.listener.follow('close', stop)
}

export default {
    init
}
