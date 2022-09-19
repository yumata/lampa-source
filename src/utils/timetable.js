import Storage from './storage'
import Favorite from './favorite'
import TMDB from './api/tmdb'
import Arrays from './arrays'
import Utils from './math'

let data     = []
let object   = false
let limit    = 300
let started  = Date.now()

/**
 * Запуск
 */
function init(){
    data = Storage.cache('timetable',limit,[])

    setInterval(extract,1000*60*2)
    setInterval(favorites,1000*60*10)

    Favorite.listener.follow('add,added',(e)=>{
        if(e.card.number_of_seasons && e.where !== 'history') update(e.card)
    })

    Favorite.listener.follow('remove',(e)=>{
        if(e.card.number_of_seasons && e.method == 'id'){
            let find = data.find(a=>a.id == e.card.id)

            if(find){
                find.removed = true

                Storage.set('timetable',data)
            }
        }
    })

    Lampa.Listener.follow('worker_storage',(e)=>{
        if(e.type == 'insert' && e.name == 'timetable'){
            data = Storage.get('timetable','[]')
        } 
    })
}

/**
 * Добавить карточки к парсингу
 * @param {[{id:integer,number_of_seasons:integer}]} elems - карточки
 */
function add(elems){
    if(started + 1000*60*2 > Date.now()) return

    elems.filter(elem=>elem.number_of_seasons && typeof elem.id == 'number').forEach(elem=>{
        let find = data.find(a=>a.id == elem.id)

        if(!find){
            data.push({
                id: elem.id,
                season: elem.number_of_seasons,
                episodes: []
            })
        }
        else{
            find.removed = Favorite.check(elem).any && !Favorite.check(elem).history ? false : true
        }
    })

    Storage.set('timetable',data)
}

/**
 * Добавить из закладок
 */
function favorites(){
    add(Favorite.get({type: 'book'}))
    add(Favorite.get({type: 'like'}))
    add(Favorite.get({type: 'wath'}))
}

function filter(episodes){
    let filtred = []
    let fileds  = ['air_date','season_number','episode_number','name','still_path']

    episodes.forEach(episode=>{
        let item = {}

        fileds.forEach(field=>{
            if(typeof episode[field] !== 'undefined') item[field] = episode[field]
        })

        filtred.push(item)
    })

    /*
    filtred = filtred.filter(episode=>{
        let create = new Date(episode.air_date)
        let today  = new Date()
            today.setHours(0,0,0,0)

        return create.getTime() >= today.getTime() ? true : false
    })
    */

    return filtred
}

/**
 * Парсим карточку
 */
function parse(){
    if(Favorite.check(object).any  && !Favorite.check(object).history){
        TMDB.get('tv/'+object.id+'/season/'+object.season,{},(ep)=>{
            object.episodes = filter(ep.episodes)

            save()
        },save)
    }
    else{
        object.removed = true //очистить из расписания если больше нету в закладках

        save()
    }
}

/**
 * Получить карточку для парсинга
 */
function extract(){
    let ids = data.filter(e=>!e.scaned && (e.scaned_time || 0) + (60 * 60 * 12 * 1000) < Date.now() && !e.removed)

    if(ids.length){
        object = ids[0]

        parse()
    }
    else{
        data.forEach(a=>a.scaned = 0)
    }

    Storage.set('timetable',data)
}

/**
 * Сохранить состояние
 */
function save(){
    if(object){
        object.scaned = 1
        object.scaned_time = Date.now()

        Storage.set('timetable',data)
    }
}

/**
 * Получить эпизоды для карточки если есть
 * @param {{id:integer}} elem - карточка
 * @returns {array}
 */
function get(elem){
    let fid = data.filter(e=>e.id == elem.id)

    return (fid.length ? fid[0] : {}).episodes || []
}

/**
 * Добавить карточку в парсинг самостоятельно
 * @param {{id:integer,number_of_seasons:integer}} elem - карточка
 */
function update(elem){
    if(elem.number_of_seasons && Favorite.check(elem).any  && !Favorite.check(elem).history && typeof elem.id == 'number'){
        let id = data.filter(a=>a.id == elem.id)

        TMDB.clear()

        if(!id.length){
            let item = {
                id: elem.id,
                season: Utils.countSeasons(elem),
                episodes: []
            }

            data.push(item)

            Storage.set('timetable',data)

            object = item
        }
        else object = id[0]

        parse()
    }
}

/**
 * Получить все данные
 * @returns {[{id:integer,season:integer,episodes:[]}]}
 */
function all(){
    return data
}

export default {
    init,
    get,
    add,
    all,
    update
}