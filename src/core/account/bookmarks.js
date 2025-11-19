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
import Noty from '../../interaction/noty'
import Timer from '../timer'
import Lang from '../lang'

let bookmarks     = [] // имеет вид [{id, cid, card_id, type, data, profile, time},...]
let bookmarks_map = {} // имеет вид {type: {card_id: bookmark, ...}, ...}

let tracker_name  = 'account_bookmarks_sync'
let tracker_data  = {
    version: 0,
    time: 0
}

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
        if(e.name == 'protocol' || (e.name == 'account_use' && e.value == 'true')) update(()=>{
            Lampa.Listener.send('state:changed', {
                target: 'favorite',
                reason: 'read'
            })
        })
    })

    Listener.follow('profile_select', ()=>{
        bookmarks = []
        bookmarks_map = {}

        // Сбрасываем трекер чтобы при смене профиля сразу получить дамп закладок
        tracker_data.time = 0
        tracker_data.version = 0

        Cache.rewriteData('other', tracker_name, tracker_data).catch((e)=>{
            console.log('Account', 'bookmarks tracker cache not reset', e.message)
        }).finally(()=>{
            update(()=>{
                Lampa.Listener.send('state:changed', {
                    target: 'favorite',
                    reason: 'profile'
                })
            })
        })
    })

    Timer.add(1000 * 60 * 5, ()=>{
        update()
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
        }).catch(()=>{
            console.warn('Account', 'bookmarks ' + method + ' fail')
        })
    }
}

/**
 * Сохранение закладок в кэш
 * @param {number} version - версия закладок на сервере
 * @return {void}
 */
function saveToCache(version){
    Cache.rewriteData('other', 'account_bookmarks_' + Permit.account.profile.id, bookmarks).then(()=>{
        tracker_data.version = version
        tracker_data.time    = Date.now()

        Cache.rewriteData('other', tracker_name, tracker_data).catch((e)=>{})
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

        console.log('Account', 'bookmarks cache load:', bookmarks.length, 'data:', data ? 'yes' : 'no')

        createMap()

        if(call) call()
    }).catch(()=>{
        console.log('Account', 'bookmarks cache not load')

        if(call) call()
    })
}

function loadTrackerData(call){
    Cache.getDataAnyCase('other', tracker_name).then((data)=>{
        if(data){
            tracker_data.version = data.version || 0
            tracker_data.time    = data.time || 0
        }

        if(call) call()
    }).catch(()=>{
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
        console.log('Account', 'sync enabled, updating bookmarks')

        loadTrackerData(()=>{
            // Если с момента последнего обновления прошло больше 15 дней, то загружаем дамп
            if(tracker_data.time < Date.now() - 1000 * 60 * 60 * 24 * 15){
                console.log('Account', 'bookmarks start full update', tracker_data.version)

                Api.load('bookmarks/dump', {dataType: 'text'}).then((result)=>{
                    // Парсим текст в массив закладок
                    WebWorker.json({
                        type: 'parse',
                        data: result
                    },(e)=>{
                        if(!e.data.bookmarks){
                            console.error('Account', 'bookmarks wrong dump format', result)

                            if(call && typeof call == 'function') call()

                            return
                        }

                        console.log('Account', 'bookmarks full update complete, total:', e.data.bookmarks.length)

                        // Переводим строки с .data в объект, обновляем локальный кэш и карту
                        rawToCard(e.data.bookmarks,()=>{
                            saveToCache(e.data.version)

                            if(call && typeof call == 'function') call()
                        })
                    })
                }).catch(()=>{
                    console.error('Account', 'bookmarks full update fail, trying load from cache')
                    
                    loadFromCache(()=>{
                        if(call && typeof call == 'function') call()
                    })
                })
            }
            // Иначе получаем только изменения с последней версии
            else{
                console.log('Account', 'bookmarks start update since', tracker_data.version)
                
                loadFromCache(()=>{
                    Api.load('bookmarks/changelog?since=' + tracker_data.version).then((result)=>{
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

                        console.log('Account', 'bookmarks update complete to version', result.version, 'changes:', result.changelog.length, 'total:', bookmarks.length)

                        if(call && typeof call == 'function') call()
                    }).catch(()=>{
                        console.warn('Account', 'bookmarks update since fail')

                        if(call && typeof call == 'function') call()
                    })
                })
            }
        })
    }
    else{
        console.log('Account', 'sync disabled')

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
        }).catch(()=>{
            console.warn('Account', 'bookmarks clear fail')
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
        bookmarks = Arrays.isArray(e.data) ? e.data : [] 

        console.log('Account', 'bookmarks rawToCard complete, total:', bookmarks.length)
        
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
    catch(e){
        console.warn('Account', 'bookmarks file create error', e.message)
    }

    if(!file){
        try{
            file = new Blob([localStorage.getItem('favorite') || '{}'], {type: 'text/plain'})
            file.lastModifiedDate = new Date()
        }
        catch(e){
            Noty.show(Lang.translate('account_export_fail'))

            console.warn('Account', 'bookmarks blob create error', e.message)
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
                else{
                    console.error('Account', 'bookmarks sync fail response')
                }

                callback && callback()
            },
            error: function(){
                console.error('Account', 'bookmarks sync fail')

                Noty.show(Lang.translate('account_export_fail'))

                callback && callback()
            }
        })
    }
    else{
        callback && callback()

        console.error('Account', 'bookmarks no create file for sync')
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