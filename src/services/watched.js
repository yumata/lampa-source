import Favorite from '../core/favorite'
import Manifest from '../core/manifest'
import Utils from '../utils/utils'

/**
 * Инициализация отправки информации о просмотренных фильмах/сериалах на сервер, для обновления популярности
 * @returns {void}
 */
function init(){
    Favorite.listener.follow('add,added',(e)=>{
        if(e.where == 'history' && e.card.id && (e.card.source == 'tmdb' || e.card.source == 'cub')){
            $.get(Utils.protocol() + 'tmdb.'+Manifest.cub_domain+'/watch?id='+e.card.id+'&cat='+(e.card.original_name ? 'tv' : 'movie'))
        }
    })
}

export default {
    init
}