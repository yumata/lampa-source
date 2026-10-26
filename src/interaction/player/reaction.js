import Player from '../player'
import Video from './video'
import Modal from '../modal'
import Template from '../template'
import Noty from '../noty'
import Bell from '../bell'
import Activity from '../activity/activity'
import Controller from '../../core/controller'
import Storage from '../../core/storage/storage'
import Lang from '../../core/lang'
import Manifest from '../../core/manifest'
import Api from '../../core/api/api'
import Utils from '../../utils/utils'
import Arrays from '../../utils/arrays'

let types   = ['shit', 'bore', 'think', 'nice', 'fire']
let percent = 90
let limit   = 500
let delay   = 1500
let timer

function init(){
    Player.listener.follow('close', (e)=>{
        clearTimeout(timer)

        let target = extract(e.data)

        if(target && allowed(target)){
            target.closed  = Date.now()
            target.enabled = Controller.enabled().name

            check(target)
        }
    })

    Player.listener.follow('start', ()=>{
        clearTimeout(timer)
    })
}

/**
 * Достаём из данных закрытого видео карточку, сезон и серию
 * @param {object} data - объект, с которым запускали плеер
 * @returns {object|null} - {key, method, id, card, season, episode, percent}
 */
function extract(data){
    if(!data || !data.timeline || data.iptv || data.tv || typeof data.url !== 'string' || Video.verifyTube(data.url)) return null

    let timeline = data.timeline
    let card     = data.card && typeof data.card == 'object' ? data.card : Activity.active().movie || null
    let method, id

    if(card && card.id){
        let source = (card.source || 'tmdb') + ''

        // Реакции есть только у карточек tmdb / cub
        if(source !== 'tmdb' && source !== 'cub') return null

        method = card.original_name || card.name ? 'tv' : 'movie'
        id     = parseInt(card.id)
    }
    else if(typeof timeline.card == 'string'){
        // Ключ привязки тайм-кода из Timeline.link(), у других источников в начале префикс — такие пропускаем
        let match = timeline.card.match(/^(tv|movie)_(\d+)$/)

        if(!match) return null

        method = match[1]
        id     = parseInt(match[2])
    }

    if(!method || !id || isNaN(id)) return null

    let target = {
        key: method + '_' + id,
        method,
        id,
        card,
        percent: parseFloat(timeline.percent) || 0
    }

    if(method == 'tv'){
        target.season  = parseInt(typeof timeline.season !== 'undefined' ? timeline.season : data.season)
        target.episode = parseInt(typeof timeline.episode !== 'undefined' ? timeline.episode : data.episode)

        if(isNaN(target.season) || isNaN(target.episode) || target.season < 1 || target.episode < 1) return null
    }

    return target
}

function allowed(target){
    if(!Storage.field('card_interfice_reactions') || window.lampa_settings.disable_features.reactions) return false

    if(target.percent < percent) return false

    let mine  = Storage.get('mine_reactions', {})
    let asked = Storage.get('reaction_asked', {})

    if(mine[target.key] && mine[target.key].length) return false

    return !asked[target.key]
}

/**
 * Для сериала проверяем, что серия последняя в сезоне
 */
function check(target){
    if(target.method == 'movie') return wait(target)

    episodes(target, (count)=>{
        if(count && target.episode >= count) wait(target)
    })
}

/**
 * Показываем не сразу после закрытия плеера, а через delay (время запроса о сезоне входит в задержку)
 */
function wait(target){
    clearTimeout(timer)

    timer = setTimeout(()=>{
        // За это время пользователь мог уйти в другое окно — тогда не мешаем, спросим в следующий раз
        if(Controller.enabled().name == target.enabled) show(target)
    }, Math.max(0, delay - (Date.now() - target.closed)))
}

/**
 * Количество серий в сезоне: из карточки, если в ней есть сезоны, иначе запрос в TMDB
 */
function episodes(target, call){
    let active = Activity.active() || {}
    let card   = [target.card, active.movie, active.card].find(c=>c && c.id == target.id && Arrays.isArray(c.seasons))

    if(card){
        let season = card.seasons.find(s=>s.season_number == target.season)

        if(season && season.episode_count) return call(season.episode_count)
    }

    Api.sources.tmdb.seasons({id: target.id}, [target.season], (json)=>{
        let season = json[target.season]

        call(season && Arrays.isArray(season.episodes) ? season.episodes.length : 0)
    })
}

function icon(type){
    return Utils.protocol() + Manifest.cub_domain + '/img/reactions/' + type + '.svg'
}

function remember(target){
    let asked = Storage.get('reaction_asked', {})
    let keys  = Arrays.getKeys(asked)

    // Не даём списку расти бесконечно, удаляем самые старые
    if(keys.length >= limit){
        keys.sort((a,b)=>asked[a] - asked[b])

        keys.slice(0, keys.length - limit + 1).forEach(k=>delete asked[k])
    }

    asked[target.key] = Date.now()

    Storage.set('reaction_asked', asked)
}

function vote(target, type){
    let mine = Storage.get('mine_reactions', {})

    if(!mine[target.key]) mine[target.key] = []

    if(mine[target.key].indexOf(type) == -1) mine[target.key].push(type)

    Storage.set('mine_reactions', mine)
}

function show(target){
    // Пока ждали ответ о сезоне, пользователь мог снова запустить плеер или окно уже открыто
    if(Player.opened() || $('.reaction-ask').length) return

    remember(target)

    let html    = Template.get('reaction_ask')
    let icons   = html.find('.reaction-ask__icon')
    let title   = html.find('.reaction-ask__title')
    let items   = html.find('.reaction-ask__items')
    let enabled = Controller.enabled().name
    let current = ''
    let front   = 0
    let select

    html.find('.reaction-ask__descr').text(Lang.translate('reactions_ask_' + target.method))

    // Две иконки: прежняя уходит, новая появляется — так анимации не перебивают друг друга
    icons.each(function(){
        let img = this

        img.onload  = ()=>img.addClass('loaded')
        img.onerror = ()=>img.removeClass('loaded')
    })

    let close = ()=>{
        Modal.close()

        Controller.toggle(enabled)
    }

    let focus = (type)=>{
        if(current == type) return

        html.removeClass('reaction-ask--' + current).addClass('reaction-ask--' + type)

        current = type

        let prev = icons.eq(front)
        let next = icons.eq(1 - front)
        let src  = icon(type)

        front = 1 - front

        prev.removeClass('reaction-ask__icon--in').addClass('reaction-ask__icon--out')
        next.removeClass('reaction-ask__icon--out').addClass('reaction-ask__icon--in')

        // Тот же адрес повторно load не вызывает, поэтому loaded снимаем только при смене картинки
        if(next.attr('src') !== src){
            next.removeClass('loaded')
            next[0].src = src
        }

        title.text(Lang.translate('reactions_' + type))
    }

    types.forEach(type=>{
        let item = $('<div class="reaction-ask__item selector"><img class="reaction-ask__item-icon" /></div>')
        let img  = item.find('img')[0]

        img.onload  = ()=>img.addClass('loaded')
        img.onerror = ()=>img.removeClass('loaded')
        img.src     = icon(type)

        item.on('hover:focus', ()=>{
            focus(type)
        }).on('hover:enter', ()=>{
            close()

            Api.sources.cub.reactionsAdd({
                method: target.method,
                id: target.id,
                type
            }, ()=>{
                vote(target, type)

                Bell.push({text: Lang.translate('discuss_voited')})
            }, ()=>{
                Noty.show(Lang.translate('reactions_ready'))
            })
        })

        if(type == 'think') select = item

        items.append(item)
    })

    focus('think')

    Modal.open({
        title: '',
        html,
        align: 'center',
        select: select[0],
        onBack: close
    })
}

export default {
    init
}
