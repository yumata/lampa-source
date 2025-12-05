import Api from './api.js'

let shots = {
    favorite: [],
    map: []
}

function init(){
    shots.favorite = Lampa.Storage.get('shots_favorite', '[]')

    createMap(Lampa.Storage.get('shots_map', '[]'))

    update()

    Lampa.Listener.follow('shots_status', updateStatus)
    Lampa.Listener.follow('shots_update', updateData)

    Lampa.Listener.follow('state:changed', (e)=>{
        if(e.target == 'favorite' && (e.reason == 'profile' || e.reason == 'read')){
            shots.favorite = []

            createMap([])

            update()
        }
    })
}

function createMap(arr){
    shots.map = {}

    arr.forEach(id=>{
        shots.map[id] = 1
    })
}

function updateStatus(shot){
    if(!shots.map[shot.id]) return

    let find = shots.favorite.find(a=>a.id == shot.id)

    if(find){
        find.status = shot.status
        find.screen = shot.screen
        find.file   = shot.file

        Lampa.Storage.set('shots_favorite', shots.favorite)
    }
}

function updateData(shot){
    if(!shots.map[shot.id]) return

    let find = shots.favorite.find(a=>a.id == shot.id)

    if(find){
        find.liked = shot.liked
        find.saved = shot.saved

        Lampa.Storage.set('shots_favorite', shots.favorite)
    }
}

function update(){
    Api.shotsList('favorite', 1, (shots)=>{
        shots.favorite = shots.results

        Lampa.Storage.set('shots_favorite', shots.favorite)
    })

    Api.shotsList('map', 1, (map)=>{
        createMap(map.results)

        Lampa.Storage.set('shots_map', map.results)
    })
}

function add(shot){
    let clone = {}

    Object.assign(clone, shot)

    delete clone.params

    Lampa.Arrays.insert(shots.favorite, 0, clone)

    if(shots.favorite.length > 20){
        shots.favorite = shots.favorite.slice(0,20)
    }

    shots.map[clone.id] = 1

    Lampa.Storage.set('shots_favorite', shots.favorite)

    Lampa.Storage.add('shots_map', clone.id)
}

function remove(where, shot){
    let find_in = shots.favorite.find(a=>a.id == shot.id)

    if(find_in) Lampa.Arrays.remove(shots.favorite, find_in)

    delete shots.map[shot.id]

    Lampa.Storage.set('shots_favorite', shots[where])

    let map = Lampa.Storage.get('shots_map', '[]')
    
    Lampa.Arrays.remove(map, shot.id)

    Lampa.Storage.set('shots_map', map)
}

function page(page, callback){
    Api.shotsList('favorite', page, (shots)=>{
        callback(shots.results)
    }, ()=>{
        callback([])
    })
}

function get(){
    return Lampa.Arrays.clone(shots.favorite)
}

function find(shot_id){
    return Boolean(shots.map[shot_id])
}

function toggle(shot, onsuccess, onerror){
    let finded = find(shot.id)

    Api.shotsFavorite(finded ? 'remove' : 'add', shot, ()=>{
        if(finded){
            remove(shot)
        }
        else {
            add(shot)
        }

        if(onsuccess) onsuccess(finded)
    }, onerror)

    return !finded
}

export default {
    init,
    update,
    remove,
    add,
    get,
    find,
    toggle,
    page
}