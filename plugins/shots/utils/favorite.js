import Api from './api.js'

let shots = {
    favorite: [],
    created: [],
    map: []
}

function init(){
    shots.favorite = Lampa.Storage.get('shots_favorite', '[]')
    shots.created  = Lampa.Storage.get('shots_created', '[]')

    createMap(Lampa.Storage.get('shots_map', '[]'))

    update()
}

function createMap(arr){
    shots.map = {}

    arr.forEach(id=>{
        shots.map[id] = 1
    })
}

function update(){
    Api.shotsList('favorite', (shots)=>{
        shots.favorite = shots.results

        Lampa.Storage.set('shots_favorite', shots.favorite)
    })

    Api.shotsList('map', (map)=>{
        createMap(map.results)

        Lampa.Storage.set('shots_map', map.results)
    })

    Api.shotsList('created', (shots)=>{
        shots.created = shots.results

        Lampa.Storage.set('shots_created', shots.created)
    })
}

function add(where, shot){
    let clone = {}

    Object.assign(clone, shot)

    delete clone.params

    if(shots[where]){
        Lampa.Arrays.insert(shots[where], 0, clone)

        if(shots[where].length > 20){
            shots[where] = shots[where].slice(0,20)
        }

        shots.map[clone.id] = 1

        Lampa.Storage.set('shots_'+where, shots[where])
        Lampa.Storage.add('shots_map', clone.id)
    }
}

function remove(where, shot){
    if(shots[where]){
        let find_in_where = shots[where].find(a=>a.id == shot.id)

        if(find_in_where) Lampa.Arrays.remove(shots[where], find_in_where)

        delete shots.map[shot.id]

        Lampa.Storage.set('shots_'+where, shots[where])

        let map = Lampa.Storage.get('shots_map', '[]')
        
        Lampa.Arrays.remove(map, shot.id)

        Lampa.Storage.set('shots_map', map)
    }
}

function page(where, page, callback){
    Api.shotsList(where, page, (shots)=>{
        callback(shots.results)
    }, ()=>{
        callback([])
    })
}

function get(where){
    return Lampa.Arrays.clone(shots[where] || [])
}

function find(shot_id){
    return Boolean(shots.map[shot_id])
}

function toggle(shot){
    let finded = find(shot.id)

    if(finded){
        remove('favorite', shot)
    }
    else {
        add('favorite', shot)
    }

    Api.shotsFavorite(finded ? 'remove' : 'add', shot, ()=>{}, ()=>{})

    return !finded
}

export default {
    init,
    update,
    add,
    get,
    find,
    toggle,
    page
}