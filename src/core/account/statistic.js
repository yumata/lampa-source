import Api from './api'
import Favorite from '../favorite'

function init(){
    Lampa.Listener.follow('full',(e)=>{
        if(e.type == 'complite'){
            let actors = []

            if(e.data.persons && e.data.persons.cast){
                e.data.persons.cast.filter(p=>p.known_for_department == 'Acting').slice(0, 4).forEach((p)=>{
                    actors.push(p.id)
                })
            }

            write('card_open', {
                card: {
                    id: e.data.movie.id,
                    type: e.data.movie.name ? 'tv' : 'movie',
                },
                genres: e.data.movie.genres ? e.data.movie.genres.map(g=>g.id) : [],
                actors
            })
        }
    })

    Favorite.listener.follow('add',(e)=>{
        write('card_favorite', {
            card: {
                id: e.card.id,
                type: e.card.name ? 'tv' : 'movie',
            }
        })
    })
}

function write(method, data){
    Api.load('statistic/write/' + method, {
        url: 'http://localhost:3100/api/statistic/write/' + method,
    }, data).catch((e)=>{
        console.error('Statistic', 'write error:', method, data)
    })
}

export default {
    init,
    write
}