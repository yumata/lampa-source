import Arrays from './arrays'
import Storage from './storage'
import Subscribe from './subscribe'
import Account from './account'
import ContentRows from '../core/content_rows'
import Lang from './lang'

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
                    title: media == 'tv' ? Lang.translate('title_continue') : Lang.translate('title_watched')
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
    if(Account.working()){
        listener.send('add', {where, card})
    }
    else{
        //read()

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
    }
}

/**
 * Удалить
 * @param {String} where 
 * @param {Object} card 
 */
function remove(where, card){
    if(Account.working()){
        listener.send('remove', {where, card, method: 'id'})
    }
    else{
        //read()

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
    //if(!Account.working()) read()

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
    if(Account.working()){
        let result = {
            any: true
        }

        category.forEach(a=>{
            result[a] = Boolean(Account.get({type: a}).find(elem=>elem.id==card.id))

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
    if(Account.working()){
        return Account.get(params)
    }
    else{
        //read()

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
    if(Account.working()){
        Account.clear(where)
    }
    else{
        //read()

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
    return Arrays.clone(get({type:'history'}).filter(e=>(type == 'tv' ? (e.number_of_seasons || e.first_air_date) : !(e.number_of_seasons || e.first_air_date))).slice(0,19)).map(e=>{e.check_new_episode = true; return e}).map(c=>{
        delete c.ready

        return c
    })
}

export default {
    listener,
    check:cloud,
    add,
    remove,
    toggle,
    get,
    init,
    clear,
    continues,
    full,
    checkAnyNotHistory,
    all
}