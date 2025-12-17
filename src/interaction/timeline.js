import Template from './template'
import Storage from '../core/storage/storage'
import Socket from '../core/socket'
import Utils from '../utils/utils'
import Account from '../core/account/account'
import Subscribe from '../utils/subscribe'
import Activity from './activity/activity'

let listener = Subscribe(), 
    viewed

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
 * Обновить прогресс просмотра
 * @param {object} params - параметры прогресса
 * @param {number} params.hash - хеш файла
 * @param {number} params.percent - процент просмотра (0-100)
 * @param {number} [params.time] - текущее время просмотра в секундах
 * @param {number} [params.duration] - общая длительность файла в секундах
 * @param {number} [params.profile] - ID профиля
 * @param {boolean} [params.received] - флаг, что данные получены с сервера
 * @returns {void}
 */
function update(params){
    if(params.hash == 0) return

    let road = viewed[params.hash]

    if(typeof road == 'undefined' || typeof road == 'number'){
        road = {
            duration: 0,
            time: 0,
            percent: 0,
            profile: 0
        }

        viewed[params.hash] = road
    }

    road.percent = params.percent

    if(typeof params.time !== 'undefined')     road.time     = params.time
    if(typeof params.duration !== 'undefined') road.duration = params.duration
    if(typeof params.profile !== 'undefined')  road.profile  = params.profile

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
 * @return {object} - объект с прогрессом просмотра {hash, percent, time, duration, profile, handler}
 */
function view(hash){
    let curent  = typeof viewed[hash] !== 'undefined' ? viewed[hash] : 0,
        profile = Account.Permit.sync ? Account.Permit.account.profile.id : 0

    let road = {
        percent: 0,
        time: 0,
        duration: 0,
        profile: 0
    }

    if(typeof curent == 'object'){
        road.percent  = curent.percent
        road.time     = curent.time
        road.duration = curent.duration
        road.profile  = curent.profile || profile
    }
    else{
        road.percent = curent || 0
        road.profile = profile
    }

    listener.send('view', {data: { hash, road }})

    return {
        hash: hash,
        percent: road.percent,
        time: road.time,
        duration: road.duration,
        profile: road.profile,
        handler: (percent,time,duration) => update({ hash, percent, time, duration, profile: road.profile })
    }
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
            let time = view(Utils.hash([1, i, card.original_name].join('')))

            if(time.percent) {
                list.push({ep: i, view: time})
            }
        }

        return return_time ? list : list.length
    }
    else{
        let time = view(Utils.hash(card.original_title))

        return return_time ? time : time.percent
    }
}

function watchedEpisode(card, season, episode, return_time = false){
    let time = view(Utils.hash([season, season > 10 ? ':' : '',episode,card.original_name || card.original_title].join('')))
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
    filename
}
