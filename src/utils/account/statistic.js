import Api from './api'
import Favorite from '../favorite'
import Menu from '../../interaction/menu'
import Activity from '../../interaction/activity'

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

    let menu_item = $(`<li class="menu__item selector">
        <div class="menu__ico">
            
        </div>
        <div class="menu__text">Статистика</div>
    </li>`)

    menu_item.on('hover:enter', ()=> {
        Activity.push({
            title: 'Статистика',
            component: 'statistic',
            page: 1
        })
    })

    Menu.render().find('.menu__list').eq(0).append(menu_item)
}

function write(method, data){
    Api.load('statistic/write/' + method, {
        url: 'http://localhost:3100/api/statistic/write/' + method,
    }, data).catch((e)=>{
        console.error('Statistic', 'write error:', method, data)
    })
}

function get(callback){
    callback([
        {
            title: 'Top 10',
            results: [
                { id: 1, title: 'Movie 1', count: 100 },
                { id: 2, title: 'Movie 2', count: 90 },
                { id: 3, title: 'Movie 3', count: 80 },
                { id: 4, title: 'Movie 4', count: 70 },
                { id: 5, title: 'Movie 5', count: 60 }
            ]
        }
    ])
}

export default {
    init,
    write,
    get
}