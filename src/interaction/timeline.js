import Template from './template'
import Storage from '../core/storage/storage'
import Socket from '../core/socket'
import Utils from '../utils/utils'
import Account from '../core/account/account'
import Subscribe from '../utils/subscribe'
import Activity from './activity/activity'

let listener = Subscribe(),
    viewed,
    index = {} // ключ карточки (card|season|episode) -> хеш, чтобы найти прогресс, если сменилось оригинальное название

/**
 * Инициализация
 * @returns {void}
 */
function init(){
    read()
}

/**
 * Прочитать прогресс просмотра из localStorage
 * @returns {void}
 */
function read(no_nolisten = false){
    viewed = Storage.get(filename(), {})
    index  = {}

    for(let hash in viewed) indexAdd(hash, viewed[hash])

    listener.send('read', {data: viewed})

    if(no_nolisten) return

    Lampa.Listener.send('state:changed', {
        target: 'timeline',
        reason: 'read',
        viewed
    })
}

/**
 * Имя файла для хранения прогресса просмотра в localStorage
 * @returns {string} - имя файла
 */
function filename(){
    return 'file_view' + (Account.Permit.sync ? '_' + Account.Permit.account.profile.id : '')
}

/**
 * Привязка прогресса к карточке. Хеш строится из оригинального названия, и если оно
 * у карточки изменится, прогресс найдется по id карточки
 * @param {object} card - карточка
 * @param {number} [season] - номер сезона
 * @param {number} [episode] - номер серии
 * @returns {object|null} - {card, season, episode} или null, если у карточки нет id
 */
function link(card, season, episode){
    if(!card || !card.id) return null

    // У TMDB id фильма и сериала могут совпадать, у других источников свои id
    let type   = card.original_name ? 'tv' : 'movie'
    let source = card.source && card.source !== 'tmdb' && card.source !== 'cub' ? card.source + '_' : ''
    let result = {
        card: (source + type + '_' + card.id).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 64)
    }

    season  = parseInt(season)
    episode = parseInt(episode)

    if(!isNaN(season))  result.season  = season
    if(!isNaN(episode)) result.episode = episode

    return result
}

/**
 * Ключ в индексе по карточке
 * @param {object} meta - {card, season, episode}
 * @returns {string}
 */
function indexKey(meta){
    return [meta.card, meta.season || 0, meta.episode || 0].join('|')
}

/**
 * Добавить запись в индекс по карточке, при совпадении оставляем более свежую
 * @param {string} hash - хеш записи
 * @param {object} road - запись прогресса
 * @returns {void}
 */
function indexAdd(hash, road){
    if(!road || typeof road !== 'object' || !road.card) return

    let key  = indexKey(road)
    let prev = viewed[index[key]]

    if(index[key] !== hash && prev && typeof prev == 'object' && (prev.updated || 0) > (road.updated || 0)) return

    index[key] = hash
}

/**
 * Обновить прогресс просмотра
 * @param {object} params - параметры прогресса
 * @param {number} params.hash - хеш файла
 * @param {number} params.percent - процент просмотра (0-100)
 * @param {number} [params.time] - текущее время просмотра в секундах
 * @param {number} [params.duration] - общая длительность файла в секундах
 * @param {number} [params.profile] - ID профиля
 * @param {number} [params.updated] - когда отметка изменилась, в миллисекундах. Для локальных изменений ставится сам
 * @param {boolean} [params.received] - флаг, что данные получены с сервера
 * @param {string} [params.card] - ключ карточки из link()
 * @param {number} [params.season] - номер сезона из link()
 * @param {number} [params.episode] - номер серии из link()
 * @returns {void}
 */
function update(params){
    if(params.hash == 0) return

    // Штампуем только свои изменения: у полученных с сервера или с другого устройства
    // уже есть штамп автора, и перезаписывать его локальным временем нельзя.
    // Пишем в params, а не только в road, потому что ниже в сокет уходит именно params.
    if(!params.received) params.updated = Date.now()

    let road = viewed[params.hash]

    if(typeof road == 'undefined' || typeof road == 'number'){
        road = {
            duration: 0,
            time: 0,
            percent: 0,
            profile: 0,
            updated: 0
        }

        viewed[params.hash] = road
    }

    road.percent = params.percent

    if(typeof params.time !== 'undefined')     road.time     = params.time
    if(typeof params.duration !== 'undefined') road.duration = params.duration
    if(typeof params.profile !== 'undefined')  road.profile  = params.profile
    if(typeof params.updated !== 'undefined')  road.updated  = params.updated

    if(params.card){
        road.card = params.card

        if(typeof params.season !== 'undefined')  road.season  = params.season
        if(typeof params.episode !== 'undefined') road.episode = params.episode

        indexAdd(params.hash, road)
    }

    // округляем время и длительность до целых секунд
    road.time     = Math.round(road.time)
    road.duration = Math.round(road.duration)

    Storage.set(filename(), viewed)

    let layers = [].concat(Activity.renderLayers())
        layers.push($(document))

    layers.forEach((layer)=>{
        let line = $('.time-line[data-hash="'+params.hash+'"]', layer).toggleClass('hide', params.percent ? false : true)

        $('> div', line).css({
            width: params.percent + '%'
        })

        $('.time-line-details[data-hash="'+params.hash+'"]', layer).each(function(){
            let f = format(road)

            $(this).find('[a="t"]').text(f.time)
            $(this).find('[a="p"]').text(f.percent)
            $(this).find('[a="d"]').text(f.duration)
            $(this).toggleClass('hide', road.duration ? false : true)
        })
    })

    listener.send('update', {data:{ hash: params.hash, road }})

    Lampa.Listener.send('state:changed', {
        target: 'timeline',
        reason: 'update',
        data:{ hash: params.hash, road }
    })

    if(!params.received && Account.hasPremium()) Socket.send('timeline',{params})
}

/**
 * Получить прогресс просмотра
 * @param {string} hash - хеш файла
 * @param {object} [meta] - привязка к карточке из link(), по ней ищем прогресс, если по хешу не нашли
 * @return {object} - объект с прогрессом просмотра {hash, percent, time, duration, profile, updated, handler} и {card, season, episode}, если есть привязка
 */
function view(hash, meta){
    let curent  = typeof viewed[hash] !== 'undefined' ? viewed[hash] : 0,
        profile = Account.Permit.sync ? Account.Permit.account.profile.id : 0

    // Оригинальное название могло измениться, тогда ищем прогресс по карточке.
    // Хеш оставляем новый, чтобы дальше прогресс писался уже под ним.
    if(typeof viewed[hash] == 'undefined' && meta && meta.card){
        let found = viewed[index[indexKey(meta)]]

        if(found) curent = found
    }

    if(!meta && curent && typeof curent == 'object' && curent.card){
        meta = {card: curent.card}

        if(typeof curent.season !== 'undefined')  meta.season  = curent.season
        if(typeof curent.episode !== 'undefined') meta.episode = curent.episode
    }

    let road = {
        percent: 0,
        time: 0,
        duration: 0,
        profile: 0,
        updated: 0
    }

    if(typeof curent == 'object'){
        road.percent  = curent.percent
        road.time     = curent.time
        road.duration = curent.duration
        road.profile  = curent.profile || profile
        road.updated  = curent.updated || 0
    }
    else{
        road.percent = curent || 0
        road.profile = profile
    }

    listener.send('view', {data: { hash, road }})

    let result = {
        hash: hash,
        percent: road.percent,
        time: road.time,
        duration: road.duration,
        profile: road.profile,
        updated: road.updated
    }

    // Привязку кладем в сам объект: его же передают в update(view), и она уйдет вместе с прогрессом
    if(meta && meta.card){
        result.card = meta.card

        if(typeof meta.season !== 'undefined')  result.season  = meta.season
        if(typeof meta.episode !== 'undefined') result.episode = meta.episode
    }

    result.handler = (percent,time,duration) => {
        let params = { hash, percent, time, duration, profile: road.profile }

        if(result.card){
            params.card = result.card

            if(typeof result.season !== 'undefined')  params.season  = result.season
            if(typeof result.episode !== 'undefined') params.episode = result.episode
        }

        update(params)
    }

    return result
}

/**
 * Создать прогресс просмотра
 * @param {object} params - параметры прогресса от функции view
 * @return {jQuery} - jQuery объект с прогрессом просмотра
 */
function render(params){
    let line = Template.get('timeline', params)

    line.toggleClass('hide',params.percent ? false : true)

    return line
}

/**
 * Создать детальную информацию о прогрессе просмотра
 * @param {object} params - параметры прогресса от функции view
 * @param {string} [str] - строка для добавления перед прогрессом
 * @return {jQuery} - jQuery объект с детальной информацией о прогрессе просмотра
 */
function details(params, str = ''){
    let line = Template.get('timeline_details', format(params))

    if(str) line.prepend(str)

    line.attr('data-hash', params.hash)

    line.toggleClass('hide',params.duration ? false : true)

    return line
}

/**
 * Проверить, смотрел ли файл
 * @param {object} card - карточка файла
 * @return {number} - процент просмотра (0-100)
 */
function watched(card, return_time = false){
    if(card.original_name){
        let max  = 24
        let list = []
        
        for(let i = 1; i <= max; i++){
            let time = view(Utils.hash([1, i, card.original_name].join('')), link(card, 1, i))

            if(time.percent) {
                list.push({ep: i, view: time})
            }
        }

        return return_time ? list : list.length
    }
    else{
        let time = view(Utils.hash(card.original_title), link(card))

        return return_time ? time : time.percent
    }
}

function watchedEpisode(card, season, episode, return_time = false){
    let time = view(Utils.hash([season, season > 10 ? ':' : '',episode,card.original_name || card.original_title].join('')), link(card, season, episode))
    return return_time ? time : time.percent
}

/**
 * Форматировать прогресс в понятный человекy вид
 * @param {object} params - параметры прогресса от функции view
 * @return {object} - объект с отформатированными параметрами {percent, time, duration}
 */
function format(params){
    let road = {
        percent: params.percent + '%',
        time: Utils.secondsToTimeHuman(params.time),
        duration: Utils.secondsToTimeHuman(params.duration)
    }

    return road
}

export default {
    init: Utils.onceInit(init),
    read,
    listener,
    render,
    update,
    view,
    details,
    format,
    watched,
    watchedEpisode,
    filename,
    link
}
