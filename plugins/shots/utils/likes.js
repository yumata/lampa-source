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

function toggle(shot_id, onsuccess, onerror){
    let found = find(shot_id)

    Api.shotsLiked(shot_id, found ? 'unlike' : 'like', ()=>{
        if(found){
            remove(shot_id)
        } 
        else {
            add(shot_id)
        }

        if(onsuccess) onsuccess(found)
    }, onerror)

    return !found
}

export default {
    find,
    add,
    remove,
    toggle
}