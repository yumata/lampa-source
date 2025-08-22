import Settings from '../interaction/settings/settings'
import TMDB from './api/tmdb'
import Arrays from './arrays'
import Storage from './storage'

function hide(){
    Settings.listener.follow('open', function (e){
        if(e.name == 'main'){
            e.body.find(['player','account','parser','server','plugins'].map(a=>'[data-component="'+a+'"]').join(', ')).addClass('hide')
        }
        else{
            e.body.find(['start_page','card_quality','card_episodes','proxy_tmdb_auto','proxy_tmdb','tmdb_proxy_api','tmdb_proxy_image','card_interfice_type','source'].map(a=>'[data-name="'+a+'"]').join(', ')).addClass('hide')
        }
    })


    let head = $('.head')
    let menu = $('.menu')

    $('.open--broadcast, .open--search,.open--notice,.open--premium',head).remove()
    $(['catalog','feed','filter','relise','anime','favorite','subscribes','timetable','mytorrents','console','about'].map(a=>'[data-action="'+a+'"]').join(', '),menu).remove()

    Arrays.remove(TMDB.genres.movie,TMDB.genres.movie.find(g=>g.id == 99))

    let genres_id = [99,10764,10766,10767,10768,10763]
    
    genres_id.forEach(id => {
        Arrays.remove(TMDB.genres.tv,TMDB.genres.tv.find(g=>g.id == id))
    })
    
    Lampa.Listener.follow('full',(e)=>{
        if(e.type == 'complite'){
            e.object.activity.render().find('.full-start-new__buttons, .full-start__icons, .full-start__footer').remove()
        }
    })
}

function init(){
    if(window.lampa_settings.demo){
        Lampa.Listener.follow('app', function (e) {
            if(e.type =='ready') hide()
        })
    }
}

export default {
    init
}
