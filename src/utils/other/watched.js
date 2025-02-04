import Favorite from '../favorite'
import Manifest from '../manifest'
import Utils from '../math'

function init(){
    Favorite.listener.follow('add,added',(e)=>{
        if(e.where == 'history' && e.card.id){
            $.get(Utils.protocol() + 'tmdb.'+Manifest.cub_domain+'/watch?id='+e.card.id+'&cat='+(e.card.original_name ? 'tv' : 'movie'))
        }
    })
}

export default {
    init
}