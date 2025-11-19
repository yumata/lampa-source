import Api from './api.js'

function find(shot_id){
    return Boolean(Lampa.Storage.get('shots_likes', '[]').find(id=>shot_id == id))
}

function add(shot_id){
    let arr = Lampa.Storage.cache('shots_likes', 100, '[]')
        arr.push(shot_id)

    Lampa.Storage.set('shots_likes', arr)
}

function remove(shot_id){
    let arr = Lampa.Storage.get('shots_likes','[]')

    Lampa.Arrays.remove(arr, shot_id)

    Lampa.Storage.set('shots_likes', arr)
}

function toggle(shot_id){
    let finded = find(shot_id)

    if(finded){
        remove(shot_id)
    } 
    else {
        add(shot_id)
    }

    Api.shotsLike(shot_id, finded ? 'unlike' : 'like', ()=>{}, ()=>{})

    return !finded
}

export default {
    find,
    add,
    remove,
    toggle
}