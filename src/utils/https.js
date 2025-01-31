import Manifest from './manifest'
import Storage from './storage'

let errors = 0

function init(){
    listen()
}

function listen(){
    Lampa.Listener.follow('request_error',(e)=>{
        if(e.error.status == 0 && e.params.url.indexOf(Manifest.cub_domain) >= 0 && Storage.field('protocol') == 'https'){
            errors++

            if(errors > 5){
                errors = 0

                Storage.set('protocol', 'http')
            }
        }
    })
}

export default {
    init
}