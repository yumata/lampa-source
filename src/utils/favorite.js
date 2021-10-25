import Arrays from './arrays'
import Storage from './storage'

let data = {}

function save(){
    Storage.set('favorite', data)
}

/**
 * Добавить
 * @param {String} where 
 * @param {Object} card 
 */
function add(where, card, limit){
    if(data[where].indexOf(card.id) < 0){
        Arrays.insert(data[where],0,card.id) 

        if(!search(card.id)) data.card.push(card)

        if(limit){
            let excess = data[where].slice(limit)

            for(let i = excess.length - 1; i >= 0; i--){
                remove(where, {id: excess[i]})
            }
        } 

        save()
    }
}

/**
 * Удалить
 * @param {String} where 
 * @param {Object} card 
 */
function remove(where, card){
    
    Arrays.remove(data[where], card.id)

    for(let i = data.card.length - 1; i >= 0; i--){
        let element = data.card[i]

        if(!check(element).any) Arrays.remove(data.card, element)
    }

    save()
}

/**
 * Найти
 * @param {Int} id 
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
    let find = check(card)

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
        like: data.like.indexOf(card.id) > -1,
        wath: data.wath.indexOf(card.id) > -1,
        book: data.book.indexOf(card.id) > -1,
        history: data.history.indexOf(card.id) > -1,
        any: true
    }

    if(!result.like && !result.wath && !result.book && !result.history) result.any = false

    return result
}

/**
 * Получить списаок по типу
 * @param {String} params.type - тип 
 * @returns Object
 */
function get(params){
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

/**
 * Запуск
 */
function init(){
    data = Storage.get('favorite','{}')

    Arrays.extend(data,{
        like: [],
        wath: [],
        book: [],
        card: [],
        history: []
    })
}

export default {
    check,
    add,
    remove,
    toggle,
    get,
    init
}