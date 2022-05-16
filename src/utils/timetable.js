import Storage from './storage'
import Favorite from './favorite'
import TMDB from './api/tmdb'

let data     = []
let object   = false

/**
 * Запуск
 */
function init(){
    data = Storage.cache('timetable',300,[])

    setInterval(extract,1000*60*2)
    setInterval(favorites,1000*60*10)
}

function add(elems){
    elems.filter(elem=>elem.number_of_seasons).forEach(elem=>{
        let id = data.filter(a=>a.id == elem.id)

        if(!id.length){
            data.push({
                id: elem.id,
                season: elem.number_of_seasons,
                episodes: []
            })
        } 
    })

    Storage.set('timetable',data)
}

function favorites(){
    add(Favorite.get({type: 'book'}))
    add(Favorite.get({type: 'like'}))
    add(Favorite.get({type: 'wath'}))
}

function parse(){
    if(Favorite.check(object).any){
        TMDB.get('tv/'+object.id+'/season/'+object.season,{},(ep)=>{
            object.episodes = ep.episodes

            save()
        },save)
    }
    else save()
}

function extract(){
    let ids = data.filter(e=>!e.scaned && (e.scaned_time || 0) + (60 * 60 * 12 * 1000) < Date.now())

    if(ids.length){
        object = ids[0]

        parse()
    }
    else{
        data.forEach(a=>a.scaned = 0)
    }

    Storage.set('timetable',data)
}

function save(){
    if(object){
        object.scaned = 1
        object.scaned_time = Date.now()

        Storage.set('timetable',data)
    }
}

function get(elem){
    let fid = data.filter(e=>e.id == elem.id)

    return (fid.length ? fid[0] : {}).episodes || []
}

function update(elem){
    if(elem.number_of_seasons && Favorite.check(elem).any){
        let id = data.filter(a=>a.id == elem.id)

        TMDB.clear()

        if(!id.length){
            let item = {
                id: elem.id,
                season: elem.number_of_seasons,
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