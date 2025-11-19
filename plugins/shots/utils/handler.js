import Api from './api.js'

let shots = {}

function init(){
    Lampa.Timer.add(1000 * 60, ()=>{
        for(let i in shots){
            check(shots[i])
        }
    })
}

function check(shot){
    if(shot.status == 'ready' || shot.status == 'error') return

    Api.videoStatus(shot.id, (json)=>{
        shot.status = json.status

        if(json.status == 'ready'){
            Lampa.Bell.push({text: Lampa.Lang.translate('shots_upload_complete_notify')})
        }

        if(json.status == 'error'){
            Lampa.Bell.push({text: Lampa.Lang.translate('shots_upload_error_notify')})
        }
    })
}

function add(shot){
    if(!shots[shot.id]) shots[shot.id] = shot
}

function stop(shot){
    delete shots[shot.id]
}

export default {
    init,
    add,
    stop
}