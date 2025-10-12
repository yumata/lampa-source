import Arrays from '../utils/arrays'
import Storage from './storage/storage'
import Subscribe from '../utils/subscribe'
import Account from './account/account'
import ContentRows from './content_rows'
import Lang from './lang'
import Utils from '../utils/utils'

let data = {}
let listener = Subscribe()
let category = ['like', 'wath', 'book', 'history', 'look', 'viewed', 'scheduled', 'continued', 'thrown']
let marks    = ['look', 'viewed', 'scheduled', 'continued', 'thrown']


/**
 * Запуск
 */
function init(){
    read()

    ContentRows.add({
        index: 1,
        screen: ['main', 'category'],
        call: (params, screen)=>{
            let media   = screen == 'main' ? 'tv' : params.url
            let results = continues(media)

            if(!results.length) return

            return function(call){
                call({
                    results,
                    title: media == 'tv' || media == 'anime' ? Lang.translate('title_continue') : Lang.translate('title_watched')
                })
            }
        }
    })
}

/**
 * Сохранить
 */
function save(){
    Storage.set('favorite', data)
}

/**
 * Добавить
 * @param {String} where 
 * @param {Object} card 
 */
function add(where, card, limit){
    if(Account.Permit.sync){
        listener.send('add', {where, card})
    }
    else{
        let find = data[where].find(id=>id == card.id)

        if(!find){
            Arrays.insert(data[where],0,card.id) 

            listener.send('add', {where, card})

            if(!search(card.id)) data.card.push(card)

            if(limit){
                let excess = data[where].slice(limit)

                for(let i = excess.length - 1; i >= 0; i--){
                    remove(where, {id: excess[i]})
                }
            } 

            save()
        }
        else{
            Arrays.remove(data[where],card.id)
            Arrays.insert(data[where],0,card.id) 

            save()

            listener.send('added', {where, card})
        }

        Lampa.Listener.send('state:changed', {
            target: 'favorite',
            reason: 'update',
            method: !find ? 'add' : 'added', 
            type: where, 
            card
        })
    }
}

/**
 * Удалить
 * @param {String} where 
 * @param {Object} card 
 */
function remove(where, card){
    if(Account.Permit.sync){
        listener.send('remove', {where, card, method: 'id'})
    }
    else{
        Arrays.remove(data[where], card.id)

        listener.send('remove', {where, card, method: 'id'})

        for(let i = data.card.length - 1; i >= 0; i--){
            let element = data.card[i]

            if(!check(element).any){
                Arrays.remove(data.card, element)

                listener.send('remove', {where, card: element, method: 'card'})
            } 
        }

        save()

        Lampa.Listener.send('state:changed', {
            target: 'favorite',
            reason: 'update',
            method: 'remove',
            type: where, 
            card
        })
    }
}

/**
 * Найти
 * @param {integer} id 
 * @returns Object
 */
function search(id){
    let found

    for (let index = 0; index < data.card.length; index++) {
        const element = data.card[index]
        
        if(element.id == id){
            found = element; break;
        }
    }

    return found
}

/**
 * Переключить
 * @param {String} where 
 * @param {Object} card 
 */
function toggle(where, card){
    let find = cloud(card)

    if(marks.find(a=>a == where)){
        let added = marks.find(a=>find[a])

        if(added && added !== where) remove(added, card)
    }

    if(find[where]) remove(where, card)
    else add(where, card)

    return find[where] ? false : true
}

/**
 * Проверить
 * @param {Object} card 
 * @returns Object
 */
function check(card){
    let result = {
        any: false
    }

    category.forEach(a=>{
        result[a] = data[a].find(id=>id == card.id)

        if(result[a]) result.any = true
    })

    return result
}


/**
 * Проверить есть ли карточка где либо кроме истории
 * @param {Object} status 
 * @returns {Boolean}
 */
function checkAnyNotHistory(status){
    let any = false

    category.filter(a=>a !== 'history').forEach(a=>{
        if(status[a]) any = true
    })

    return any
}

/**
 * Облако, закладки из cub
 * @param {Object} card 
 * @returns {Object}
 */
function cloud(card){
    if(Account.Permit.sync){
        let result = {
            any: false
        }

        category.forEach(a=>{
            result[a] = Boolean(Account.Bookmarks.find({type: a, id: card.id}))

            if(result[a]) result.any = true
        })

        return result
    }
    else return check(card)
}

/**
 * Получить списаок по типу
 * @param {String} params.type - тип 
 * @returns Object
 */
function get(params){
    if(Account.Permit.sync){
        return Account.Bookmarks.get(params)
    }
    else{
        let result = []
        let ids    = data[params.type]

        ids.forEach(id => {
            for (let i = 0; i < data.card.length; i++) {
                const card = data.card[i];
                
                if(card.id == id) result.push(card)
            }
        })

        return result
    }
}

/**
 * Очистить
 * @param {String} where 
 * @param {Object} card 
 */
function clear(where, card){
    if(Account.Permit.sync){
        Account.Bookmarks.clear(where)
    }
    else{
        if(card) remove(where, card)
        else{
            for(let i = data[where].length - 1; i >= 0; i--){
                let card = search(data[where][i])
        
                if(card) remove(where, card)
            }
        }
    }
}

/**
 * Считать последние данные
 */
function read(){
    data = Storage.get('favorite','{}')

    let empty = {
        card: []
    }

    category.forEach(a=>{
        empty[a] = []
    })

    Arrays.extend(data, empty)

    Lampa.Listener.send('state:changed', {
        target: 'favorite',
        reason: 'read'
    })
}

/**
 * Получить весь список что есть
 */
function full(){
    let empty = {
        card: []
    }

    category.forEach(a=>{
        empty[a] = []
    })

    Arrays.extend(data, empty)

    return data
}

function all(){
    let result = {}

    category.forEach(a=>{
        result[a] = get({type: a})
    })

    return result
}

function continues(type){
    let result = get({type:'history'})

    result = result.filter(e=>{
        if(type == 'anime') return (e.number_of_seasons || e.first_air_date) && Utils.containsJapanese(e.original_name || e.name || '')
        else if(type == 'tv') return e.number_of_seasons || e.first_air_date
        else return !(e.number_of_seasons || e.first_air_date)
    })

    return Arrays.clone(result.slice(0,19))

    //return Arrays.clone(get({type:'history'}).filter(e=>(type == 'tv' ? (e.number_of_seasons || e.first_air_date) : !(e.number_of_seasons || e.first_air_date))).slice(0,19)).map(e=>{e.check_new_episode = true; return e})
}

export default {
    listener,
    init: Utils.onceInit(init),
    check:cloud,
    add,
    remove,
    toggle,
    get,
    clear,
    continues,
    full,
    checkAnyNotHistory,
    all,
    read
}