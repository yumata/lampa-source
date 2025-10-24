import Manifest from './manifest'
import Storage from './storage/storage'

let errors = 0

/**
 * Инициализация отслеживания ошибок HTTPS запросов
 * Если более 5 запросов подряд к домену cub.red завершаются ошибкой статуса 0,
 * то в настройках сохраняется протокол http вместо https
 */
function init(){
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