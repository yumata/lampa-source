import Api from './api.js'

let created = []

function init(){
    created = Lampa.Storage.get('shots_created', '[]')

    update()

    Lampa.Listener.follow('shots_status', updateStatus)
    Lampa.Listener.follow('shots_update', updateData)

    Lampa.Listener.follow('state:changed', (e)=>{
        if(e.target == 'favorite' && (e.reason == 'profile' || e.reason == 'read')){
            created  = []

            update()
        }
    })
}

function updateStatus(shot){
    let find = created.find(a=>a.id == shot.id)

    if(find){
        find.status = shot.status
        find.screen = shot.screen
        find.file   = shot.file

        Lampa.Storage.set('shots_created', created)
    }
}

function updateData(shot){
    let find = created.find(a=>a.id == shot.id)

    if(find){
        find.liked = shot.liked
        find.saved = shot.saved

        Lampa.Storage.set('shots_created', created)
    }
}

function update(){
    Api.shotsList('created', 1, (shots)=>{
        created = shots.results

        Lampa.Storage.set('shots_created', created)
    })
}

function add(shot){
    let clone = {}

    Object.assign(clone, shot)

    delete clone.params

    Lampa.Arrays.insert(created, 0, clone)

    if(created.length > 20){
        created = created.slice(0,20)
    }

    Lampa.Storage.set('shots_created', created)
}

function remove(shot){
    let find_in = created.find(a=>a.id == shot.id)

    if(find_in) Lampa.Arrays.remove(created, find_in)

    Lampa.Storage.set('shots_created', created)

    Lampa.Listener.send('shots_status', {id: shot.id, status: 'deleted', file: shot.file, screen: shot.screen})
}

function page(page, callback){
    Api.shotsList('created', page, (shots)=>{
        callback(shots.results)
    }, ()=>{
        callback([])
    })
}

function get(){
    return Lampa.Arrays.clone(created)
}

function find(id){
    return Boolean(created.find(a=>a.id == id))
}

export default {
    init,
    remove,
    add,
    get,
    find,
    page
}