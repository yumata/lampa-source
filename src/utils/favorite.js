import Arrays from './arrays'
import Storage from './storage'

let data = {}

function save(){
    Storage.set('favorite', data)
}

function add(where, card){
    if(data[where].indexOf(card.id) < 0){
        Arrays.insert(data[where],0,card.id) 

        if(!search(card.id)) data.card.push(card)

        save()
    }
}

function remove(where, card){
    
    Arrays.remove(data[where], card.id)

    for(let i = data.card.length - 1; i >= 0; i--){
        let element = data.card[i]

        if(!check(element).any) Arrays.remove(data.card, element)
    }

    save()
}

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

function toggle(where, card){
    let find = check(card)

    if(find[where]) remove(where, card)
    else add(where, card)
}

function check(card){
    let result = {
        like: data.like.indexOf(card.id) > -1,
        wath: data.wath.indexOf(card.id) > -1,
        book: data.book.indexOf(card.id) > -1,
        any: true
    }

    if(!result.like && !result.wath && !result.book) result.any = false

    return result
}

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

function init(){
    data = Storage.get('favorite','{}')

    Arrays.extend(data,{
        like: [],
        wath: [],
        book: [],
        card: []
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