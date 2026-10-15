import Template from './template'
import Storage from '../core/storage/storage'
import Socket from '../core/socket'
import Utils from '../utils/utils'
import Account from '../core/account/account'
import Subscribe from '../utils/subscribe'
import Activity from './activity/activity'

let listener = Subscribe(),
    viewed,
    index = {} // ключ карточки (card|season|episode) -> hash, для поиска тайм-кода при смене названия

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

    buildIndex()

    listener.send('read', {data: viewed})

    if(no_nolisten) return

    Lampa.Listener.send('state:changed', {
        target: 'timeline',
        reason: 'read',
        viewed
    })
}

/**
 * Ключ индекса для привязки к карточке
 * @param {object} meta - объект с полями card, season, episode
 * @returns {string}
 */
function indexKey(meta){
    return [meta.card, meta.season, meta.episode].join('|')
}

/**
 * Добавить запись в индекс. При коллизии оставляем более свежую запись
 * @param {string} hash - хеш записи
 * @param {object} road - запись прогресса
 * @returns {void}
 */
function indexAdd(hash, road){
    if(!road || typeof road !== 'object' || !road.card) return

    let key   = indexKey(road)
    let exist = index[key] ? viewed[index[key]] : null

    if(!exist || typeof exist !== 'object' || (exist.updated || 0) <= (road.updated || 0)) index[key] = hash
}

/**
 * Построить индекс по всем записям прогресса
 * @returns {void}
 */
function buildIndex(){
    index = {}

    for(let hash in viewed) indexAdd(hash, viewed[hash])
}

/**
 * Привязка тайм-кода к карточке. Нужна, чтобы найти прогресс, если у карточки сменится оригинальное название и, как следствие, хеш
 * @param {object} card - карточка
 * @param {number} [season] - номер сезона (для сериала)
 * @param {number} [episode] - номер серии (для сериала)
 * @returns {object|null} - {card, season, episode} или null, если привязать нельзя
 */
function link(card, season, episode){
    if(!card || !card.id) return null

    let type   = card.original_name ? 'tv' : 'movie'
    let source = (card.source || 'tmdb') + ''
    let key    = type + '_' + card.id

    // id разных источников могут совпадать, поэтому для не tmdb/cub добавляем префикс источника
    if(source !== 'tmdb' && source !== 'cub') key = source + '_' + key

    // так же чистит сервер, держим ключ одинаковым на клиенте и на сервере
    key = key.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 64)

    let result = {card: key}

    if(type == 'tv'){
        season  = parseInt(season)
        episode = parseInt(episode)

        // Без сезона и серии привязка сериала не имеет смысла
        if(isNaN(season) || isNaN(episode)) return null

        result.season  = season
        result.episode = episode
    }

    return result
}

/**
 * Выбрать из объекта только поля привязки к карточке
 * @param {object} obj - объект с полями card, season, episode
 * @returns {object} - {card, season, episode} или пустой объект
 */
function linked(obj){
    let result = {}

    if(obj && obj.card){
        result.card = obj.card

        if(typeof obj.season !== 'undefined')  result.season  = obj.season
        if(typeof obj.episode !== 'undefined') result.episode = obj.episode
    }

    return result
}

/**
 * Имя файла для хранения прогресса просмотра в localStorage
 * @returns {string} - имя файла
 */
function filename(){
    return 'file_view' + (Account.Permit.sync ? '_' + Account.Permit.account.profile.id : '')
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
 * @param {string} [params.card] - ключ карточки из link()
 * @param {number} [params.season] - номер сезона (вместе с card)
 * @param {number} [params.episode] - номер серии (вместе с card)
 * @param {boolean} [params.received] - флаг, что данные получены с сервера
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

    // Привязка к карточке необязательна: старые записи и сторонние плагины работают только по хешу
    if(params.card){
        road.card = params.card + ''

        if(typeof params.season !== 'undefined')  road.season  = params.season
        if(typeof params.episode !== 'undefined') road.episode = params.episode
    }
    
    // округляем время и длительность до целых секунд
    road.time     = Math.round(road.time)
    road.duration = Math.round(road.duration)

    indexAdd(params.hash, road)

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
 * @param {object} [meta] - привязка к карточке из link(). Если по хешу ничего нет, ищем по ней
 * @return {object} - объект с прогрессом просмотра {hash, percent, time, duration, profile, updated, handler, [card, season, episode]}
 */
function view(hash, meta){
    let curent  = typeof viewed[hash] !== 'undefined' ? viewed[hash] : 0,
        profile = Account.Permit.sync ? Account.Permit.account.profile.id : 0

    // По хешу ничего нет, возможно у карточки сменилось название — ищем по привязке.
    // Хеш оставляем новый, чтобы дальше прогресс писался уже под ним
    if(typeof viewed[hash] == 'undefined' && meta && meta.card){
        let found = index[indexKey(meta)]

        if(found && typeof viewed[found] == 'object') curent = viewed[found]
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
        updated: road.updated,
        handler: (percent,time,duration) => update(Object.assign({ hash, percent, time, duration, profile: road.profile }, linked(meta)))
    }

    Object.assign(result, linked(meta))

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
