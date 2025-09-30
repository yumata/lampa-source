import Favorite from '../favorite'
import Permit from './permit'
import Socket from '../socket'
import Api from './api'
import Arrays from '../../utils/arrays'
import Utils from '../../utils/utils'
import WebWorker from '../../utils/worker'
import Platform from '../platform'
import Listener from './listener'
import Storage from '../storage/storage'
import Cache from '../../utils/cache'
import Tracker from '../tracker'

let bookmarks     = [] // имеет вид [{id, cid, card_id, type, data, profile, time},...]
let bookmarks_map = {} // имеет вид {type: {card_id: bookmark, ...}, ...}
let tracker       = new Tracker('account_bookmarks_sync')

/**
 * Запуск
 * @return {void}
 */
function init(){
    Favorite.listener.follow('add,added',(e)=>{
        push('add', e.where, e.card)
    })

    Favorite.listener.follow('remove',(e)=>{
        if(e.method == 'id') push('remove', e.where, e.card)
    })

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'protocol') update(()=>{
            Lampa.Listener.send('state:changed', {
                target: 'favorite',
                reason: 'protocol'
            })
        })
    })

    Listener.follow('profile_select', ()=>{
        bookmarks = []
        bookmarks_map = {}

        update(()=>{
            Lampa.Listener.send('state:changed', {
                target: 'favorite',
                reason: 'profile'
            })
        })
    })
}

/**
 * Добавить/Удалить закладку
 * @param {String} method - add/remove
 * @param {String} type - тип закладки
 * @param {Object} card - карточка
 * @return {void}
 */
function push(method, type, card){
    if(Permit.sync){
        let find = bookmarks.find((elem)=>elem.card_id == card.id && elem.type == type)

        Api.load('bookmarks/' + method, {}, {
            type: type,
            data: JSON.stringify(Utils.clearCard(Arrays.clone(card))),
            card_id: card.id,
            id: find ? find.id : 0
        }).then(()=>{
            update(()=>{
                // Оповещаем другие устройства о изменении закладок
                Socket.send('bookmarks',{}) 

                // Глобальное оповещение об изменении закладок для обновления карточек
                Lampa.Listener.send('state:changed', {
                    target: 'favorite',
                    reason: 'update',
                    method,
                    card,
                    type
                })
            })
        }).catch(()=>{})
    }
}

/**
 * Сохранение закладок в кэш
 * @param {number} version - версия закладок на сервере
 * @return {void}
 */
function saveToCache(version){
    Cache.rewriteData('other', 'account_bookmarks_' + Permit.account.profile.id, bookmarks).then(()=>{
        tracker.update({
            version, 
            time: Date.now()
        })
    }).catch((e)=>{
        console.log('Account', 'bookmarks cache not saved', e.message)
    })
}

/**
 * Загрузка закладок из кэша
 * @param {function} call - вызов по окончании
 * @return {void}
 */
function loadFromCache(call){
    if(bookmarks.length) return call && call()

    Cache.getData('other', 'account_bookmarks_' + Permit.account.profile.id).then((data)=>{
        bookmarks = data && data.length ? data : []

        createMap()
    }).catch(()=>{
        console.log('Account', 'bookmarks cache not load')
    }).finally(()=>{
        if(call) call()
    })
}

/**
 * Загрузка и обновление закладок
 * @param {function} call - вызов по окончании
 * @return {void}
 */
function update(call){
    if(Permit.sync){
        // Если с момента последнего обновления прошло больше 15 дней, то загружаем дамп
        if(tracker.time() < Date.now() - 1000 * 60 * 60 * 24 * 15){
            console.log('Account', 'bookmarks start full update', tracker.version())

            Api.load('bookmarks/dump', {dataType: 'text'}).then((result)=>{
                // Парсим текст в массив закладок
                WebWorker.json({
                    type: 'parse',
                    data: result
                },(e)=>{
                    // Переводим строки с .data в объект, обновляем локальный кэш и карту
                    rawToCard(e.data.bookmarks,()=>{
                        saveToCache(e.data.version)

                        if(call && typeof call == 'function') call()
                    })
                })
            }).catch(()=>{
                loadFromCache(()=>{
                    if(call && typeof call == 'function') call()
                })
            })
        }
        // Иначе получаем только изменения с последней версии
        else{
            console.log('Account', 'bookmarks start update since', tracker.version())
            
            loadFromCache(()=>{
                Api.load('bookmarks/changelog?since=' + tracker.version()).then((result)=>{
                    result.changelog.forEach((change)=>{
                        if(change.action == 'remove'){
                            let find = bookmarks.find((book)=>book.id == change.entity_id)

                            if(find) Arrays.remove(bookmarks, find)
                        }
                        else if(change.action == 'update'){
                            let find = bookmarks.find((book)=>book.id == change.entity_id)

                            if(find){
                                find.time = change.updated_at

                                Arrays.remove(bookmarks, find)
                                Arrays.insert(bookmarks, 0, find)
                            }
                        }
                        else if(change.action == 'add'){
                            if(change.data){
                                change.data = Utils.clearCard(Arrays.decodeJson(change.data, {}))

                                Arrays.insert(bookmarks, 0, change)
                            }
                        }
                        else if(change.action == 'clear'){
                            let filter = bookmarks.filter((book)=>book.type == change.entity_id)

                            filter.forEach((book)=>Arrays.remove(bookmarks, book))
                        }
                    })

                    // Сохраняем обновленные закладки в кэш
                    saveToCache(result.version)

                    // Обновляем карту
                    createMap()

                    // Обновляем каналы на андроид тв
                    updateChannels()
                }).finally(()=>{
                    if(call && typeof call == 'function') call()
                })
            })
        }
    }
    else{
        rawToCard([], ()=>{
            if(call && typeof call == 'function') call()
        })
    }
}

/**
 * Очистка закладок
 * @param {string} where - группа закладок для очистки
 * @return {void}
 */
function clear(where){
    if(Permit.sync){
        Api.load('bookmarks/clear', {}, {
            type: 'group',
            group: where
        }).then(()=>{
            update(()=>{
                // Оповещаем другие устройства о изменении закладок
                Socket.send('bookmarks',{}) 

                // Глобальное оповещение об изменении закладок для обновления карточек
                Lampa.Listener.send('state:changed', {
                    target: 'favorite',
                    reason: 'clear',
                    type: where
                })
            })
        })
    }
}

/**
 * Получить закладки по типу
 * @param {object} params - {type}
 * @return {array} - [card, ...]
 */
function get(params){
    return bookmarks.filter(elem=>elem.type == params.type).map((elem)=>{
        return elem.data
    })
}

/**
 * Найти закладку по типу и id
 * @param {object} params - {type, id}
 * @return {object|null} - card или null
 */
function find(params){
    return bookmarks_map[params.type] ? bookmarks_map[params.type][params.id]?.data : null
}

/**
 * Получить все закладки
 * @return {array} - [card, ...]
 */
function all(){
    return bookmarks.map((elem)=>{
        return elem.data
    })
}

/**
 * Обновление каналов на андроид тв
 * @return {void}
 */
function updateChannels(){
    if(Platform.is('android') && typeof AndroidJS.saveBookmarks !== 'undefined' && bookmarks.length){
        WebWorker.json({
            type: 'stringify',
            data: bookmarks
        },(j)=>{
            AndroidJS.saveBookmarks(j.data)
        })
    }
}

/**
 * Преобразует row.data из строки в объект
 * @param {array} rows - массив закладок из БД
 * @param {function} call - вызов по окончании
 * @return {void}
 */
function rawToCard(rows, call){
    WebWorker.utils({
        type: 'account_bookmarks_parse',
        data: rows
    },(e)=>{
        bookmarks = e.data
        
        createMap()

        updateChannels()

        if(call) call()
    })
}

/**
 * Создаем карту закладок для быстрого поиска
 * @return {void}
 */
function createMap(){
    bookmarks_map = {}

    bookmarks.forEach((elem)=>{
        elem.data = Utils.clearCard(elem.data)

        if(!bookmarks_map[elem.type]) bookmarks_map[elem.type] = {}

        bookmarks_map[elem.type][elem.card_id] = elem
    })
}

/**
 * Синхронизация закладок из локальных на сервер
 * @param {function} callback - вызов по окончании
 * @return {void}
 */
function sync(callback){
    let file
    
    try{
        file = new File([localStorage.getItem('favorite') || '{}'], "bookmarks.json", {
            type: "text/plain",
        })
    }
    catch(e){}

    if(!file){
        try{
            file = new Blob([localStorage.getItem('favorite') || '{}'], {type: 'text/plain'})
            file.lastModifiedDate = new Date()
        }
        catch(e){
            Noty.show(Lang.translate('account_export_fail'))
        }
    }

    if(file){
        let formData = new FormData($('<form></form>')[0])
            formData.append("file", file, "bookmarks.json")
        
        $.ajax({
            url: Api.url() + 'bookmarks/sync',
            type: 'POST',
            data: formData,
            async: true,
            cache: false,
            contentType: false,
            enctype: 'multipart/form-data',
            processData: false,
            headers: {
                token: Permit.token,
                profile: Permit.account.profile.id
            },
            success: function (j) {
                if(j.secuses){
                    Noty.show(Lang.translate('account_sync_secuses'))

                    update()
                }

                callback && callback()
            },
            error: function(){
                Noty.show(Lang.translate('account_export_fail'))

                callback && callback()
            }
        })
    }
    else{
        callback && callback()
    }
}

export default {
    init: Utils.onceInit(init),
    push,
    update,
    clear,
    get,
    all,
    sync,
    find
}