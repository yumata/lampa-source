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
    if(shot.status == 'ready' || shot.status == 'error') return stop(shot)

    Api.uploadStatus(shot.id, (json)=>{
        if(json.status == 'ready'){
            Lampa.Bell.push({
                icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                text: Lampa.Lang.translate('shots_upload_complete_notify')
            })
        }

        if(json.status == 'error'){
            Lampa.Bell.push({
                icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                text: Lampa.Lang.translate('shots_upload_error_notify')
            })
        }

        if(json.status == 'ready' || json.status == 'error') stop(shot)

        Lampa.Listener.send('shots_status', {...json})
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